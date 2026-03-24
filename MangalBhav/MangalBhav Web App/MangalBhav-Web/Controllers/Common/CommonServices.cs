using FaceUPAI.DataAccessService;
using FaceUPAI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using static FaceUPAI.CommonServices;

namespace FaceUPAI
{

    public static class ApiHandler
    {
        public static IActionResult Handle(Func<IActionResult> action, ControllerBase controller)
        {
            try
            {
                return action();
            }
            catch (SqlException ex)
            {
                return controller.StatusCode(500, new
                {
                    Success = false,
                    Message = "Database error occurred.",
                    Error = ex.Message
                });
            }
            catch (Exception ex)
            {
                return controller.StatusCode(500, new
                {
                    Success = false,
                    Message = "Unexpected error occurred.",
                    Error = ex.Message
                });
            }
        }
    }



    public class CommonServices
    {
        public class Database
        {
            public static string getConnectionString()
            {

                return new ConfigurationBuilder().AddJsonFile("appsettings.json")
                                          .Build().GetSection("ConnectionStrings")["DefaultConnection"];
            }
        }
    }


    public class Helper
    {
       
        public class Logger
        {
            private static string _logFilePath;

           

            public static void LogInfo(string message)
            {
                WriteLog("Info", message);
            }

            public static void LogError(Exception ex)
            {
                WriteLog("Error", $"{ex.Message} {ex.Source} {ex.StackTrace}");
            }

            private static void WriteLog(string type, string message)
            {
                try
                {
                    if (string.IsNullOrEmpty(_logFilePath))
                        throw new InvalidOperationException("Logger not initialized. Call Logger.Initialize() first.");

                    using (StreamWriter sw = File.AppendText(_logFilePath))
                    {
                        sw.WriteLine("Start >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                        sw.WriteLine($"{type} : {DateTime.Now:G} : {message}");
                        sw.WriteLine("End >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                    }
                }
                catch
                {
                    // Do nothing (or optionally log to console)
                }
            }
        }
    }



    [ApiController]
    public class CommonDataServices : Controller
    {

     

       
        [HttpPost]
        [Route("EmployeeWorkSummary")]
        public IActionResult GetEmployeeWorkSummary([FromBody] WorkSummaryRequest request)
        {
            List<KeyValue> result = new List<KeyValue>();

            using (SqlConnection connection = new SqlConnection(Database.getConnectionString()))
            {
                // Prepare the SQL query for executing the stored procedure
                string sqlQuery = "exec CRMEmployeeWorkPlanSummary @ProductServiceID, @BusinessObjectiveID, @EmployeeID, @dateFrom, @dateTo";
                SqlCommand cmd = new SqlCommand(sqlQuery, connection);

                // Add parameters to the command
                cmd.Parameters.AddWithValue("@ProductServiceID", request.ProductServiceID);
                cmd.Parameters.AddWithValue("@BusinessObjectiveID", request.BusinessObjectiveID);
                cmd.Parameters.AddWithValue("@EmployeeID", request.EmployeeID);
                cmd.Parameters.AddWithValue("@dateFrom", request.DateFrom);
                cmd.Parameters.AddWithValue("@dateTo", request.DateTo);

                connection.Open();

                // Execute the query and process the results
                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        result.Add(new KeyValue(reader.GetString(0).Trim(), reader.GetInt32(1).ToString()));
                    }
                }
            }

            return Ok(new { result });
        }

        // Class to represent the incoming request body
        public class WorkSummaryRequest
        {
            public int ProductServiceID { get; set; }
            public int BusinessObjectiveID { get; set; }
            public int EmployeeID { get; set; }
            public DateTime DateFrom { get; set; }
            public DateTime DateTo { get; set; }
        }

        // Class to represent the key-value result
        public class KeyValue
        {
            public string Key { get; set; }
            public string Value { get; set; }

            public KeyValue(string key, string value)
            {
                Key = key;
                Value = value;
            }
        }
    }
}