using FaceUPAI.DataAccessService;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using System.Xml;
using static FaceUPAI.CommonServices;
using JsonSerializer = System.Text.Json.JsonSerializer;
using Syntizen.Aadhaar.AuaKua;
using System.Net;
using FaceUPAI.Models;
using System.Security.Cryptography;
using System.Data.SqlTypes;
using FirebaseAdmin.Messaging;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
namespace FaceUPAI.Controllers
{
    public class AuthenticationController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }

    public class CAPSLoginController : Controller
    {
        private IConfiguration _config;

        public CAPSLoginController(IConfiguration config)
        {
            _config = config;
        }

        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("VedantaLogin")]
        public IActionResult VedantaLogin(string UserName)
        {
           // string decodedPassword = DecodeBase64Password(Password);

            IActionResult response = Unauthorized();
            return GenerateJSONWebToken(UserName); //Valiate user and generate the token if valid.
        }


        private string DecodeBase64Password(string encodedPassword)
        {
            try
            {
                byte[] data = Convert.FromBase64String(encodedPassword);
                return Encoding.UTF8.GetString(data);
            }
            catch (FormatException)
            {
                // Handle invalid Base64 string
                return null;
            }
        }
        [HttpPost]
        [Route("MachineAttendanceInsert")]
        public IActionResult StudentSubjectPlanListSelect(int TenantID, int CollegeID, string SubjectName, string SubjectCode, string CardNumber, DateTime AttendanceDateTime, string PeriodNumber, string FromTime, string ToTime)
        {
            SqlParameter[] parameters = new SqlParameter[] {
                new SqlParameter("@TenantID", TenantID.ToString()),
                new SqlParameter("@CollegeID", CollegeID.ToString()),
        new SqlParameter("@SubjectName", SubjectName.ToString()),
        new SqlParameter("@SubjectCode", SubjectCode.ToString()),
        new SqlParameter("@CardNumber", CardNumber.ToString()),
        new SqlParameter("@AttendanceDateTime", AttendanceDateTime),
        new SqlParameter("@PeriodNumber", PeriodNumber),
        new SqlParameter("@FromTime", FromTime),
        new SqlParameter("@ToTime", ToTime),

            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "MachineAttendanceInsert", parameters))
            {
                if (dataReader.HasRows)
                {
                    return Ok(new
                    {
                        Status = "Success"
                    });
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }





        [HttpPost]
        [Route("StudentSubjectPlanListSelect")]
        public IActionResult StudentSubjectPlanListSelect(int SchoolID, int AcademicSessionID, int StandardID, bool IsActive)
        {
            SqlParameter[] parameters = new SqlParameter[] {
           new SqlParameter("@SchoolID", SchoolID.ToString()),
           new SqlParameter("@AcademicSessionID", AcademicSessionID.ToString()),
           new SqlParameter("@StandardID", StandardID.ToString()),
           new SqlParameter("@IsActive", IsActive ? 1 : 0),
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "StudentSubjectPlanListSelectAllByQuery", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    // Converting DataTable to JSON
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult); // Return the data as JSON
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }



        [HttpPost]
        [Route("rptStudentExamresultByType")]
        public IActionResult rptStudentExamresultByType(int SchoolID, int AcademicSessionID, int StandardID, string Termname, string ExamType)
        {

            SqlParameter[] parameters = new SqlParameter[] {
                new SqlParameter("@SchoolID", SchoolID.ToString()),
                new SqlParameter("@AcademicSessionID", AcademicSessionID.ToString()),
                new SqlParameter("@StandardID", StandardID.ToString()),
                new SqlParameter("@ExamType", ExamType),
                   new SqlParameter("@Termname", Termname),
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "rptStudentExamresultByType", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    // Converting DataTable to JSON
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult); // Return the data as JSON
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }



        [HttpPost]
        [Route("getTotalPayableAmount")]
        public IActionResult getTotalPayableAmount(int CollegeID, int FeeCategoryID, int CourseID)
        {
            int FeeTermDateID = 17906;

            SqlParameter[] parameters = new SqlParameter[] {
                new SqlParameter("@CollegeID", CollegeID.ToString()),
                new SqlParameter("@FeeCategoryID", FeeCategoryID.ToString()),
                new SqlParameter("@CourseID", CourseID.ToString()),
                new SqlParameter("@FeeTermDateID", FeeTermDateID.ToString())
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "GetTotalPayableAmount", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    // Converting DataTable to JSON
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult); // Return the data as JSON
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }



        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("GetPanditListing")]
        public IActionResult GetPanditListing(
    int PageNumber = 1,
    int PageSize = 10,
    string Search = "",
    double? Latitude = null,
    double? Longitude = null
)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
        new SqlParameter("@PageNumber", PageNumber),
        new SqlParameter("@PageSize", PageSize),
        new SqlParameter("@Search", string.IsNullOrEmpty(Search) ? (object)DBNull.Value : Search),
        new SqlParameter("@Latitude", Latitude.HasValue ? (object)Latitude.Value : DBNull.Value),
        new SqlParameter("@Longitude", Longitude.HasValue ? (object)Longitude.Value : DBNull.Value)
            };

            using (SqlDataReader dataReader =
                DataAccess.ExecuteReader(
                    CommandType.StoredProcedure,
                    "GetPanditListing",
                    parameters))
            {
                DataTable dt = new DataTable();
                dt.Load(dataReader);

                return Ok(JsonConvert.SerializeObject(dt));
            }
        }














        [HttpPost]
        [Route("StudentSubjectPlanOptinalListSelectAllByQuery")]
        public IActionResult StudentSubjectPlanOptinalListSelectAllByQuery(int SchoolID, int AcademicSessionID, int StandardID, bool IsActive)
        {
            SqlParameter[] parameters = new SqlParameter[] {
        new SqlParameter("@SchoolID", SchoolID.ToString()),
        new SqlParameter("@AcademicSessionID", AcademicSessionID.ToString()),
        new SqlParameter("@StandardID", StandardID.ToString()),
        new SqlParameter("@IsActive", IsActive ? 1 : 0),
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "StudentSubjectPlanOptinalListSelectAllByQuery", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    // Converting DataTable to JSON
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult); // Return the data as JSON
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }




        public class BatchRequest
        {
            public string BatchData { get; set; }
        }

     

        /// <summary>
        /// Selects all records from the DynamicDashboard table by a foreign key.
        /// </summary>
        [HttpPost]
        [Route("StudentInsertUpdate")]
        [EnableCors("AllowAll")]
        public IActionResult StudentInsertUpdate(string BatchData)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@BatchData", BatchData)
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "StudentInsertUpdate", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    // Converting DataTable to JSON
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult); // Return the data as JSON
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }



        [HttpPost]
        [Route("GetDashboardStatistics")]
        [EnableCors("AllowAll")]
        public IActionResult GetDashboardStatistics()
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
               
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "GetDashboardStatistics", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    // Converting DataTable to JSON
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult); // Return the data as JSON
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }




        [HttpPost]
        [Route("UserReferralHistoryReport")]
        [EnableCors("AllowAll")]
        public IActionResult UserReferralHistoryReport(
    [FromQuery] DateTime? DateFrom, [FromQuery] DateTime? DateTo,
    [FromQuery] string Name, [FromQuery] string Phone, [FromQuery] string State)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
        new SqlParameter("@DateFrom", (object)DateFrom ?? DBNull.Value),
        new SqlParameter("@DateTo", (object)DateTo ?? DBNull.Value),
        new SqlParameter("@Name", (object)Name ?? DBNull.Value),
        new SqlParameter("@Phone", (object)Phone ?? DBNull.Value),
        new SqlParameter("@State", (object)State ?? DBNull.Value)
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "UserReferralHistoryReport", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult);
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }

        [HttpPost]
        [Route("UserReferralSummaryReport")]
        [EnableCors("AllowAll")]
        public IActionResult UserReferralSummaryReport(
            [FromQuery] DateTime? DateFrom, [FromQuery] DateTime? DateTo,
            [FromQuery] string Name, [FromQuery] string Phone, [FromQuery] string State)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
        new SqlParameter("@DateFrom", (object)DateFrom ?? DBNull.Value),
        new SqlParameter("@DateTo", (object)DateTo ?? DBNull.Value),
        new SqlParameter("@Name", (object)Name ?? DBNull.Value),
        new SqlParameter("@Phone", (object)Phone ?? DBNull.Value),
        new SqlParameter("@State", (object)State ?? DBNull.Value)
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "UserReferralSummaryReport", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult);
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }



        [HttpPost]
        [Route("BroadcastInsert")]
        [EnableCors("AllowAll")]
        public IActionResult BroadcastInsert([FromBody] BroadcastInsertModel model)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
        new SqlParameter("@TenantID", model.TenantID),
        new SqlParameter("@Domain", model.Domain),
        new SqlParameter("@Identifier", model.Identifier),
        new SqlParameter("@Description", model.Description),
        new SqlParameter("@DateAdded", model.DateAdded)
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "BroadcastInsert", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    var jsonResult = JsonConvert.SerializeObject(dataTable.Rows[0]);
                    return Ok(jsonResult);
                }
                else
                {
                    return NotFound("Insert failed.");
                }
            }
        }



        public class BroadcastInsertModel
        {
            public int TenantID { get; set; }
            public string Domain { get; set; }
            public string Identifier { get; set; }
            public string Description { get; set; }
            public DateTime DateAdded { get; set; }
        }



        [HttpPost]
        [Route("BookingReport")]
        [EnableCors("AllowAll")]
        public IActionResult BookingReport(
            [FromQuery] DateTime? DateFrom, [FromQuery] DateTime? DateTo,
            [FromQuery] string Name, [FromQuery] string Phone, [FromQuery] string State,
            [FromQuery] string Status)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
        new SqlParameter("@DateFrom", (object)DateFrom ?? DBNull.Value),
        new SqlParameter("@DateTo", (object)DateTo ?? DBNull.Value),
        new SqlParameter("@Name", (object)Name ?? DBNull.Value),
        new SqlParameter("@Phone", (object)Phone ?? DBNull.Value),
        new SqlParameter("@State", (object)State ?? DBNull.Value),
        new SqlParameter("@Status", (object)Status ?? DBNull.Value)
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "BookingReport", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult);
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }


        [HttpPost]
        [Route("ChatPanditListSelect")]
        [EnableCors("AllowAll")]
        public IActionResult ChatPanditListSelect([FromQuery] string SearchText)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
        new SqlParameter("@SearchText", (object)SearchText ?? DBNull.Value)
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "ChatPanditListSelect", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult);
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }

        [HttpPost]
        [Route("PanditDailyConversationsSelect")]
        [EnableCors("AllowAll")]
        public IActionResult PanditDailyConversationsSelect(
            [FromQuery] int PanditUserID, [FromQuery] DateTime ChatDate)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
        new SqlParameter("@PanditUserID", PanditUserID),
        new SqlParameter("@ChatDate", ChatDate)
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "PanditDailyConversationsSelect", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult);
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }

        [HttpPost]
        [Route("PanditBhaktDayTranscriptSelect")]
        [EnableCors("AllowAll")]
        public IActionResult PanditBhaktDayTranscriptSelect(
            [FromQuery] int PanditUserID, [FromQuery] int BhaktUserID, [FromQuery] DateTime ChatDate)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
        new SqlParameter("@PanditUserID", PanditUserID),
        new SqlParameter("@BhaktUserID", BhaktUserID),
        new SqlParameter("@ChatDate", ChatDate)
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "PanditBhaktDayTranscriptSelect", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult);
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }

        [HttpPost]
        [Route("UnansweredBhaktMessagesReportSelect")]
        [EnableCors("AllowAll")]
        public IActionResult UnansweredBhaktMessagesReportSelect(
            [FromQuery] DateTime DateFrom, [FromQuery] DateTime DateTo, [FromQuery] int? PanditUserID)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
        new SqlParameter("@FromDate", DateFrom),
        new SqlParameter("@ToDate", DateTo),
        new SqlParameter("@PanditUserID", (object)PanditUserID ?? DBNull.Value)
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "UnansweredBhaktMessagesReportSelect", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult);
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }



        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("DeleteUserWithDependencies")]
       
        public IActionResult DeleteUserWithDependencies(int userID)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@UserID", userID)
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "DeleteUserWithDependencies", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    // Converting DataTable to JSON
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult); // Return the data as JSON
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }






        /// <summary>
        /// Selects all records from the DynamicDashboard table by a foreign key.
        /// </summary>
        [HttpPost]
        [Route("StudentSubjectPlanOptionalBatchUpdate")]
        public IActionResult StudentSubjectPlanOptionalBatchUpdate([FromBody] BatchRequest request)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@BatchData", request.BatchData)
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "StudentSubjectPlanOptionalBatchUpdate", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    // Converting DataTable to JSON
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult); // Return the data as JSON
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }


        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("GetPanditDetails")]
        public IActionResult GetPanditDetails()
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
             
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "GetPanditDetails", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    // Converting DataTable to JSON
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult); // Return the data as JSON
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }





        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("SendOtpSms")]
        public async Task<IActionResult> SendOtpSms(string mobileNo, string otp)
        {
            try
            {
                string message = $"{otp} is your OTP to access. OTP is confidential and valid for 10 minutes. For security reasons, DO NOT share this OTP with anyone. MangalBhav Connect Icon";

                string encodedMsg = System.Net.WebUtility.UrlEncode(message)
                                                      .Replace("+", "%20");

                string apiUrl = $"https://smsapp.wocom365.com/pushapi/sendbulkmsg" +
                                $"?username=Vedanta" +
                                $"&dest={mobileNo}" +
                                $"&apikey=6JYHVQKpor9sTTCOxCa6UFopcNEyKrEN" +
                                $"&signature=MNGLBV" +
                                $"&msgtype=PM" +
                                $"&msgtxt={encodedMsg}" +
                                $"&entityid=1201159703513437045" +
                                $"&templateid=1207177614549864835";

                HttpClientHandler handler = new HttpClientHandler
                {
                    ServerCertificateCustomValidationCallback =
                        HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                };

                using (HttpClient client = new HttpClient(handler))
                {
                    var response = await client.GetAsync(apiUrl);
                    var responseData = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            message = "SMS API failed",
                            response = responseData
                        });
                    }

                    return Ok(new
                    {
                        success = true,
                        message = "OTP sent successfully",
                        response = responseData
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }




        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("getRazorPayUniqueOrderID")]
        public async Task<IActionResult> GetRazorPayUniqueOrderID(int amount)
        {
            try
            {
                string apiUrl = "https://api.razorpay.com/v1/orders";


                string query = "Domain = 'RazorPay' ";

                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@TenantID", 1),
            new SqlParameter("@Query", query),
                };

                List<MasterData> masterDataList = new List<MasterData>();

                using (SqlDataReader dataReader = DataAccess.ExecuteReader(
                    CommandType.StoredProcedure, "MasterDataSelectByQuery", parameters))
                {
                    while (dataReader.Read())
                    {
                        MasterData data = MakeMasterData(dataReader);
                        masterDataList.Add(data);
                    }
                }

                // 🔥 STEP 2: Extract refresh_token
                var refreshTokenData = masterDataList
                    .FirstOrDefault(x => x.Identifier == "access_token");

                if (refreshTokenData == null)
                    return BadRequest("Refresh token not found");

                string refreshToken = refreshTokenData.Description;






                // Fixed Bearer Token
                //  string razorpayToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJhdWQiOiJTTlNJd0dmT2kwV2JaYSIsImp0aSI6IlNWa3NlVXkzekFYUmN5IiwiaWF0IjoxNzc0NTA2NDY1LCJuYmYiOjE3NzQ1MDY0NjUsInN1YiI6IiIsImV4cCI6MTc4MjQ1NTI2NSwidXNlcl9pZCI6Iks4ZXZPWVZHUTdMdTZPIiwibWVyY2hhbnRfaWQiOiJLOGV2T2dMakJ0ZUU0SyIsInNjb3BlcyI6WyJyZWFkX3dyaXRlIl0sImNvdW50cnlfY29kZSI6IklOIn0.h_gmw-_VTILPvLx7maqBLPxobxjfjn9N60TowIUubwkzVCyJP5qqTOsC1AalGn-rh3EnuIgwOqyj4gqOMfmgaA";

                string razorpayToken = refreshToken;

                HttpClientHandler handler = new HttpClientHandler
                {
                    ServerCertificateCustomValidationCallback =
                        HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                };

                using (HttpClient client = new HttpClient(handler))
                {
                    // Authorization Header
                    client.DefaultRequestHeaders.Authorization =
                        new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", razorpayToken);

                    var requestBody = new
                    {
                        amount = amount,
                        currency = "INR",
                        receipt = "receipt#1",
                        notes = new
                        {
                            key1 = "value3",
                            key2 = "value2"
                        }
                    };

                    var json = System.Text.Json.JsonSerializer.Serialize(requestBody);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await client.PostAsync(apiUrl, content);

                    var responseData = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                        return BadRequest(responseData);

                    var razorResponse = System.Text.Json.JsonSerializer.Deserialize<JsonElement>(responseData);

                    string orderId = razorResponse.GetProperty("id").GetString();

                    return Ok(new
                    {
                        success = true,
                        orderID = orderId,
                        fullResponse = razorResponse
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }




        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("verifyRazorPayPayment")]
        public IActionResult VerifyRazorPayPayment(
    string paymentId,
    string orderId,
    string signature
)
        {
            try
            {
                string razorpaySecret = "fvGn5d4RGD87Qq43LcVEOKYj";

                bool isValid = VerifySignature(orderId, paymentId, signature, razorpaySecret);

                return Ok(new
                {
                    success = isValid,
                    message = isValid ? "Payment verified" : "Invalid signature"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }


        private bool VerifySignature(string orderId, string paymentId, string signature, string secret)
        {
            string payload = orderId + "|" + paymentId;

            var keyBytes = Encoding.UTF8.GetBytes(secret);

            using (var hmac = new HMACSHA256(keyBytes))
            {
                var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
                var generatedSignature = BitConverter.ToString(hash).Replace("-", "").ToLower();

                return generatedSignature == signature;
            }
        }

        public class SaveFCMTokenRequest
        {
            public int UserID { get; set; }
            public string FCMToken { get; set; }
            public string Platform { get; set; }
        }

        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("SaveFCMToken")]
        public IActionResult SaveFCMToken(
            [FromBody] SaveFCMTokenRequest request)
        {
            SqlParameter[] parameters =
            {
        new SqlParameter("@UserID", request.UserID),
        new SqlParameter("@FCMToken", request.FCMToken),
        new SqlParameter("@Platform", request.Platform)
    };

            int id = Convert.ToInt32(
                DataAccess.ExecuteScalar(
                    CommandType.StoredProcedure,
                    "UserFCMTokenSave",
                    parameters
                )
            );

            return Ok(new
            {
                ID = id
            });
        }



        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("GetUnreadNotificationCount")]
        public IActionResult GetUnreadNotificationCount(int userID)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@UserID", userID),
               

            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "GetUnreadNotificationCount", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    // Converting DataTable to JSON
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult); // Return the data as JSON
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }



        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("MarkNotificationsSeen")]
        public IActionResult MarkNotificationsSeen(int userID,int flag)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@UserID", userID),
                  new SqlParameter("@Flag", flag),

            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "MarkNotificationsSeen", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    // Converting DataTable to JSON
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult); // Return the data as JSON
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }




        [HttpGet]
        [Route("GenerateFestivalNotifications")]
        public IActionResult GenerateFestivalNotifications()
        {
            try
            {
                SqlParameter[] parameters = { };

                DataAccess.ExecuteNonQuery(
                    CommandType.StoredProcedure,
                    "GenerateFestivalNotifications",
                    parameters
                );

                return Ok(new
                {
                    Success = true,
                    Message = "Festival notifications generated successfully."
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Error = ex.Message
                });
            }
        }



        [HttpGet]
        [Route("SendPendingNotifications")]
        public async Task<IActionResult> SendPendingNotifications()
        {
            int sentCount = 0;

            try
            {
                SqlParameter[] notificationParams = new SqlParameter[] { };

                DataTable notificationTable =
    DataAccess.ExecuteDataSet(
        "",
        CommandType.Text,
         @"
SELECT *
FROM NotificationQueue
WHERE IsSent = 0 AND UserID IS NOT NULL
  AND CreatedDate >= CAST(GETDATE() AS DATE)
  AND CreatedDate < DATEADD(DAY, 1, CAST(GETDATE() AS DATE));
",
        notificationParams
    ).Tables[0];

                foreach (DataRow notificationRow in notificationTable.Rows)
                {
                    int notificationID =
                        Convert.ToInt32(notificationRow["ID"]);

                    int userID =
                        Convert.ToInt32(notificationRow["UserID"]);

                    string title =
                        notificationRow["Title"].ToString();

                    string message =
                        notificationRow["Message"].ToString();

                    string notificationType =
                        notificationRow["NotificationType"].ToString();

                    string referenceID =
                        notificationRow["ReferenceID"]?.ToString() ?? "";

                    SqlParameter[] tokenParams = new SqlParameter[] { };

                    DataTable tokenTable =
                        DataAccess.ExecuteDataSet(
                            "",
                            CommandType.Text,
                            $@"SELECT FCMToken
           FROM UserFCMToken
           WHERE UserID = {userID}
           AND IsActive = 1",
                            tokenParams
                        ).Tables[0];

                    if (tokenTable.Rows.Count == 0)
                    {
                        DataAccess.ExecuteNonQuery(
                            CommandType.Text,
                            $@"UPDATE NotificationQueue
                       SET ErrorMessage = 'No Active Token Found'
                       WHERE ID = {notificationID}",
                            new SqlParameter[] { });

                        continue;
                    }

                    foreach (DataRow tokenRow in tokenTable.Rows)
                    {
                        string token =
                            tokenRow["FCMToken"].ToString();

                        try
                        {
                            var firebaseMessage =
                                new FirebaseAdmin.Messaging.Message()
                                {
                                    Token = token,

                                    Notification =
                                        new FirebaseAdmin.Messaging.Notification()
                                        {
                                            Title = title,
                                            Body = message
                                        },

                                    Data =
                                        new Dictionary<string, string>()
                                        {
                                    { "NotificationType", notificationType },
                                    { "ReferenceID", referenceID }
                                        }
                                };

                            string firebaseResponse =
                                await FirebaseMessaging
                                    .DefaultInstance
                                    .SendAsync(firebaseMessage);

                            DataAccess.ExecuteNonQuery(
                                CommandType.Text,
                                $@"UPDATE NotificationQueue
                           SET
                               IsSent = 1,
                               SentDate = GETDATE(),
                               FirebaseResponse = '{firebaseResponse.Replace("'", "''")}'
                           WHERE ID = {notificationID}",
                                new SqlParameter[] { });

                            sentCount++;
                        }
                        catch (Exception ex)
                        {
                            System.IO.File.AppendAllText(
                                "firebase-error.txt",
                                DateTime.Now + System.Environment.NewLine +
                                ex.ToString() + System.Environment.NewLine +
                                "--------------------------------" + System.Environment.NewLine
                            );

                            DataAccess.ExecuteNonQuery(
                                CommandType.Text,
                                $@"UPDATE NotificationQueue
           SET ErrorMessage = '{ex.Message.Replace("'", "''")}'
           WHERE ID = {notificationID}",
                                new SqlParameter[] { });

                            continue; // move to next token
                        }
                    }
                }

                return Ok(new
                {
                    Success = true,
                    SentCount = sentCount
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    Success = false,
                    Error = ex.ToString()
                });
            }
        }


        [HttpGet]
    [Route("TestNotification")]
    public async Task<IActionResult> TestNotification()
    {
        try
        {
                SqlParameter[] parameters = new SqlParameter[] { };

                object tokenObj = DataAccess.ExecuteScalar(
                    CommandType.Text,
                    "SELECT TOP 1 FCMToken FROM UserFCMToken WHERE IsActive = 1",
                    parameters
                );

                if (tokenObj == null)
            {
                return BadRequest("No FCM Token Found");
            }

            string token = tokenObj.ToString();

            var firebaseMessage =
                new FirebaseAdmin.Messaging.Message()
                {
                    Token = token,

                    Notification =
                        new FirebaseAdmin.Messaging.Notification()
                        {
                            Title = "Mangal Bhav",
                            Body = "Firebase Test Successful"
                        }
                };

            string response =
                await FirebaseMessaging
                    .DefaultInstance
                    .SendAsync(firebaseMessage);

            return Ok(new
            {
                Success = true,
                FirebaseResponse = response
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                Success = false,
                Error = ex.ToString()
            });
        }
    }


    [HttpPost]
        [EnableCors("AllowAll")]
        [Route("refreshRazorPaySchoolCredentials")]
        public async Task<IActionResult> RefreshRazorPaySchoolCredentials()
        {
            try
            {
                string apiUrl = "https://auth.razorpay.com/token";

                // 🔥 STEP 1: Get existing RazorPay data from DB
                string query = "Domain = 'RazorPay'";

                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@TenantID", 1),
            new SqlParameter("@Query", query),
                };

                List<MasterData> masterDataList = new List<MasterData>();

                using (SqlDataReader dataReader = DataAccess.ExecuteReader(
                    CommandType.StoredProcedure, "MasterDataSelectByQuery", parameters))
                {
                    while (dataReader.Read())
                    {
                        MasterData data = MakeMasterData(dataReader);
                        masterDataList.Add(data);
                    }
                }

                // 🔥 STEP 2: Extract refresh_token
                var refreshTokenData = masterDataList
                    .FirstOrDefault(x => x.Identifier == "refresh_token");

                if (refreshTokenData == null)
                    return BadRequest("Refresh token not found");

                string refreshToken = refreshTokenData.Description;

                // 🔥 STEP 3: Call Razorpay refresh API
                HttpClientHandler handler = new HttpClientHandler
                {
                    ServerCertificateCustomValidationCallback =
                        HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                };

                using (HttpClient client = new HttpClient(handler))
                {
                    var requestBody = new
                    {
                        client_id = "SNSIwGfOi0WbZa",
                        client_secret = "fvGn5d4RGD87Qq43LcVEOKYj",
                        grant_type = "refresh_token",
                        refresh_token = refreshToken
                    };

                    var json = System.Text.Json.JsonSerializer.Serialize(requestBody);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await client.PostAsync(apiUrl, content);
                    var responseData = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                        return BadRequest(responseData);

                    var razorResponse = System.Text.Json.JsonSerializer.Deserialize<JsonElement>(responseData);

                  

                    return Ok(new
                    {
                        success = true,
                        message = "RazorPay credentials fetched successfully",
                        data = razorResponse
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }





        public MasterData MakeMasterData(SqlDataReader dataReader)
        {
            MasterData masterData = new MasterData();
            masterData.MasterDataID = DataAccess.GetInt32(dataReader, "MasterDataID", 0);
            masterData.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
            masterData.ParentItemID = DataAccess.GetInt32(dataReader, "ParentItemID", 0);
            masterData.Description = DataAccess.GetString(dataReader, "Description", String.Empty);
            masterData.Domain = DataAccess.GetString(dataReader, "Domain", String.Empty);
            masterData.Identifier = DataAccess.GetString(dataReader, "Identifier", String.Empty);
            masterData.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
            masterData.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
            masterData.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);
            masterData.MasterDataLevel = DataAccess.GetString(dataReader, "MasterDataLevel", String.Empty);

            return masterData;
        }


        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("ImportFestivalsByYear")]
        public async Task<IActionResult> ImportFestivalsByYear()
        {
            try
            {
                string apiKey = "8KsskvPKdX4s490A4Xh2flW7NCbGzgao";

                string apiUrl = $"https://calendarific.com/api/v2/holidays?api_key={apiKey}&country=IN&year=2026";

                HttpClientHandler handler = new HttpClientHandler
                {
                    ServerCertificateCustomValidationCallback =
                        HttpClientHandler.DangerousAcceptAnyServerCertificateValidator
                };

                using (HttpClient client = new HttpClient(handler))
                {
                    var response = await client.GetAsync(apiUrl);

                    var responseData = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                        return BadRequest(responseData);

                    var json = System.Text.Json.JsonDocument.Parse(responseData);

                    var holidays = json.RootElement
                        .GetProperty("response")
                        .GetProperty("holidays");

                    List<object> insertedFestivals = new List<object>();

                    foreach (var item in holidays.EnumerateArray())
                    {
                        var festival = new
                        {
                            FestivalName = item.GetProperty("name").GetString(),
                            Description = item.GetProperty("description").GetString(),
                            FestivalDate = DateTime.Parse(item.GetProperty("date").GetProperty("iso").GetString()),
                            Year = 2026,
                            CountryCode = item.GetProperty("country").GetProperty("id").GetString(),
                            CountryName = item.GetProperty("country").GetProperty("name").GetString(),
                            Type = string.Join(",", item.GetProperty("type").EnumerateArray().Select(x => x.GetString())),
                            PrimaryType = item.GetProperty("primary_type").GetString(),
                            Locations = item.GetProperty("locations").GetString(),
                            States = item.GetProperty("states").GetString(),
                            CanonicalURL = item.GetProperty("canonical_url").GetString(),
                            UrlID = item.GetProperty("urlid").GetString(),
                            DateAdded = DateTime.Now
                        };

                        SqlParameter[] parameters = new SqlParameter[]
                        {
                    new SqlParameter("@FestivalName", festival.FestivalName),
                    new SqlParameter("@Description", festival.Description),
                    new SqlParameter("@FestivalDate", festival.FestivalDate),
                    new SqlParameter("@Year", festival.Year),
                    new SqlParameter("@CountryCode", festival.CountryCode),
                    new SqlParameter("@CountryName", festival.CountryName),
                    new SqlParameter("@Type", festival.Type),
                    new SqlParameter("@PrimaryType", festival.PrimaryType),
                    new SqlParameter("@Locations", festival.Locations),
                    new SqlParameter("@States", festival.States),
                    new SqlParameter("@CanonicalURL", festival.CanonicalURL),
                    new SqlParameter("@UrlID", festival.UrlID),
                    new SqlParameter("@DateAdded", festival.DateAdded)
                        };

                        int festivalID = Convert.ToInt32(
                            DataAccess.ExecuteScalar(
                                CommandType.StoredProcedure,
                                "FestivalsInsert",
                                parameters
                            )
                        );

                        insertedFestivals.Add(new
                        {
                            FestivalID = festivalID,
                            festival.FestivalName
                        });
                    }

                    return Ok(new
                    {
                        success = true,
                        message = "Festivals imported successfully",
                        totalInserted = insertedFestivals.Count,
                        festivals = insertedFestivals
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }





        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("sendWhatsAppOtp")]
        public async Task<IActionResult> SendWhatsAppOtp(string phoneno, string otp)
        {
            try
            {
                string apiUrl = "https://icpaas.in/v23.0/1141759089009405/messages";

                using (HttpClient client = new HttpClient())
                {
                    // ✅ Header (changed from apikey → Authorization)
                    client.DefaultRequestHeaders.Add("Authorization", "6170f1a7-2a2c-4a4a-84d1-1deaebe8277c");

                    // ✅ New request body (matching Postman)
                    var requestBody = new
                    {
                        messaging_product = "whatsapp",
                        recipient_type = "individual",
                        to = phoneno,
                        type = "template",
                        template = new
                        {
                            name = "vedantaotpverification",
                            language = new
                            {
                                code = "en"
                            },
                            components = new object[]
                            {
                        new
                        {
                            type = "body",
                            parameters = new object[]
                            {
                                new
                                {
                                    type = "text",
                                    text = otp
                                }
                            }
                        },
                        new
                        {
                            type = "button",
                            sub_type = "url",
                            index = "0",
                            parameters = new object[]
                            {
                                new
                                {
                                    type = "text",
                                    text = otp
                                }
                            }
                        }
                            }
                        },
                        biz_opaque_callback_data = "OTP_CALLBACK"
                    };

                    var json = System.Text.Json.JsonSerializer.Serialize(requestBody);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await client.PostAsync(apiUrl, content);
                    var responseData = await response.Content.ReadAsStringAsync();

                    if (!response.IsSuccessStatusCode)
                    {
                        return BadRequest(new
                        {
                            success = false,
                            error = responseData
                        });
                    }

                    return Ok(new
                    {
                        success = true,
                        message = "WhatsApp OTP sent successfully",
                        response = responseData
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = ex.Message
                });
            }
        }




        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("GenerateGeminiResponse")]
        public async Task<IActionResult> GenerateGeminiResponse(string prompt)
        {
            try
            {
                string apiKey = "AIzaSyDhLExOhoZa9db7TusLGslbp-Ds-mTRlj8";

                string apiUrl =
                $"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={apiKey}";

                using (HttpClient client = new HttpClient())
                {
                    var requestBody = new
                    {
                        contents = new[]
                        {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
                    };

                    var json = System.Text.Json.JsonSerializer.Serialize(requestBody);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await client.PostAsync(apiUrl, content);

                    var responseData = await response.Content.ReadAsStringAsync();

                    var geminiResponse = System.Text.Json.JsonDocument.Parse(responseData);

                    string output =
                    geminiResponse.RootElement
                    .GetProperty("candidates")[0]
                    .GetProperty("content")
                    .GetProperty("parts")[0]
                    .GetProperty("text")
                    .GetString();

                    return Ok(new { response = output });
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        /// <summary>
        /// Selects all records from the DynamicDashboard table by a foreign key.
        /// </summary>
        [HttpPost]
        [Route("CopyReportcardSetup")]
        public IActionResult CopyReportcardSetup(string OldAcademicReportCardID, string NewSchoolID, string CopyClassGroup)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@OldAcademicReportCardID", OldAcademicReportCardID),
                new SqlParameter("@NewSchoolID", NewSchoolID),
                new SqlParameter("@CopyClassGroup", CopyClassGroup)

            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "CopyReportcardSetup", parameters))
            {
                var dataTable = new DataTable();
                dataTable.Load(dataReader);

                if (dataTable.Rows.Count > 0)
                {
                    // Converting DataTable to JSON
                    var jsonResult = JsonConvert.SerializeObject(dataTable);
                    return Ok(jsonResult); // Return the data as JSON
                }
                else
                {
                    return NotFound("No data found.");
                }
            }
        }


        private IActionResult GenerateJSONWebToken(string UserName)
        {
            using (SqlConnection connection = new SqlConnection(Database.getConnectionString()))
            {
                var SQLQuery = "exec [UserLoginByUserNamePhone] @UserName";

                SqlCommand cmd = new SqlCommand(SQLQuery, connection);
                cmd.Parameters.AddWithValue("@UserName", UserName);

                connection.Open();

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.HasRows && reader.Read())
                    {
                        // 🔐 JWT Creation
                        var securityKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(_config["Jwt:Key"])
                        );

                        var credentials = new SigningCredentials(
                            securityKey,
                            SecurityAlgorithms.HmacSha256
                        );

                        var claims = new[]
                        {
                    new Claim(JwtRegisteredClaimNames.Sub, reader[0].ToString()),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
                };

                        var token = new JwtSecurityToken(
                            _config["Jwt:Issuer"],
                            _config["Jwt:Issuer"],
                            claims,
                            expires: DateTime.Now.AddDays(7),
                            signingCredentials: credentials
                        );

                        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

                        // 📦 Convert SQL row to dictionary (dynamic response)
                        var data = new Dictionary<string, object>();

                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            var columnName = reader.GetName(i);
                            var value = reader.IsDBNull(i) ? null : reader.GetValue(i);

                            data[columnName] = value;
                        }

                        // ➕ Attach token
                        data["token"] = tokenString;

                        return Ok(data);
                    }
                }
            }

            return Unauthorized(new { message = "Invalid username" });
        }




        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("UploadImages")]
        public async Task<IActionResult> UploadImages([FromForm] IFormFile file, [FromForm] string entityType, [FromForm] string entityID, [FromForm] string filePurpose)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { Status = "Error", Message = "No file provided." });
                }

                var folderPath = getServerPathByPurpose(filePurpose);
                string fileExtension = Path.GetExtension(file.FileName).ToLower();

                if (fileExtension != ".mp3")
                {
                    fileExtension = ".png";
                }

                string uniqueFileName = $"{DateTime.Now.Ticks}{fileExtension}"; // Unique file name
                string fileFolderPath = Path.Combine(folderPath);
                string filePath = Path.Combine(fileFolderPath, uniqueFileName);

                if (!Directory.Exists(fileFolderPath))
                {
                    Directory.CreateDirectory(fileFolderPath);
                }

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(new
                {
                    Status = "Success",
                    FileUrl = $"/uploads/{filePurpose}/{uniqueFileName}", // Relative file path
                    FilePurpose = filePurpose,
                    FileName = uniqueFileName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Error", Message = ex.Message });
            }
        }



        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("UploadFile")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] string entityType, [FromForm] string entityID, [FromForm] string filePurpose)
        {
            try
            {
                if (file == null || file.Length == 0)
                {
                    return BadRequest(new { Status = "Error", Message = "No file provided." });
                }

                var folderPath = getServerPathByPurpose(filePurpose);
                string fileExtension = Path.GetExtension(file.FileName);
                string uniqueFileName = $"{DateTime.Now.Ticks}{fileExtension}"; // Unique file name
                string fileFolderPath = Path.Combine(folderPath);
                string filePath = Path.Combine(fileFolderPath, uniqueFileName);

                if (!Directory.Exists(fileFolderPath))
                {
                    Directory.CreateDirectory(fileFolderPath);
                }

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                return Ok(new
                {
                    Status = "Success",
                    FileUrl = $"/uploads/{filePurpose}/{uniqueFileName}", // Relative file path
                    FilePurpose = filePurpose,
                    FileName = uniqueFileName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Error", Message = ex.Message });
            }
        }











       


        [HttpPost]
        [Route("UpdateFile")]
        public async Task<IActionResult> UpdateFile([FromBody] UploadRequest request)
        {
            try
            {

                var entityType = request.EntityType;
                var entityID = request.EntityID;
                var imagePurpose = request.ImagePurpose;
                var templateName = request.TemplateName;
                var htmlContent = request.HtmlContent;


                var folderPath = getServerPathByPurpose(imagePurpose);
                string DBfileName = templateName;

                string fileFolderPath = Path.Combine(folderPath);
                string filePath = Path.Combine(fileFolderPath, DBfileName);


                if (!Directory.Exists(fileFolderPath))
                {
                    Directory.CreateDirectory(fileFolderPath);
                }


                await System.IO.File.WriteAllTextAsync(filePath, htmlContent);

                /*               
                                string fileUrl = $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host}/assets/{imagePurpose}/{DBfileName}";
                */
                return Ok(new
                {
                    Status = "Success",
                    FileUrl = filePath,
                    fileName = DBfileName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Status = "Error", Message = ex.Message });
            }
        }
        public class UploadRequest
        {
            public string EntityType { get; set; }
            public int EntityID { get; set; }
            public string ImagePurpose { get; set; }
            public string TemplateName { get; set; }
            public string HtmlContent { get; set; } // HTML content
        }




        /// <summary>
        /// Selects all records from the DynamicDashboard table by a foreign key.
        /// </summary>
        [HttpPost]
        [Route("DynamicDashboardMapAllByUserRoleID")]
        public IActionResult DynamicDashboardMapAllByUserRoleID(int roleID, int staffID)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@RoleID", roleID),
                new SqlParameter("@StaffID", staffID)
            };

            using (SqlDataReader dataReader = DataAccess.ExecuteReader(System.Data.CommandType.StoredProcedure, "DynamicDashboardMapAllByUserRoleID", parameters))
            {
                List<MappingDynamicDashboard> DynamicDashboardList = new List<MappingDynamicDashboard>();
                while (dataReader.Read())
                {
                    MappingDynamicDashboard DynamicDashboard = MakeMappingDynamicDashboard(dataReader);
                    DynamicDashboardList.Add(DynamicDashboard);
                }

                return Ok(new { DynamicDashboardList });
            }
        }


        [HttpPost]
        [Route("rptDateWiseCourseAttendance")]
        public IActionResult CommonMappingKeyData(int collegeID)
        {
            var today = DateTime.Today;
            var yesterday = today.AddDays(-1);
            try
            {
                // Define parameters
                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@CollegeID", collegeID),
            new SqlParameter("@StartDate",today ),
            new SqlParameter("@EndDate", today)

                };

                // Execute stored procedure and load into DataTable
                using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "rptDateWiseCourseAttendance", parameters))
                {
                    var dataTable = new DataTable();
                    dataTable.Load(dataReader);

                    if (dataTable.Rows.Count > 0)
                    {
                        // Convert DataTable to JSON
                        var jsonResult = JsonConvert.SerializeObject(dataTable);
                        return Ok(jsonResult); // return JSON string
                    }
                    else
                    {
                        return NotFound("No data found.");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }


        [HttpPost]
        [Route("rptAttendanceSummary")]
        public IActionResult GetAttendanceSummary(int tenantID)
        {
            try
            {
                // Define parameters for the stored procedure
                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@TenantID", tenantID),
            new SqlParameter("@CourseName", "MBBS")
                };

                // Execute the stored procedure and load results into a DataTable
                using (SqlDataReader dataReader = DataAccess.ExecuteReader(
                    CommandType.StoredProcedure,
                    "rptAttendanceSummary",
                    parameters))
                {
                    var dataTable = new DataTable();
                    dataTable.Load(dataReader);

                    if (dataTable.Rows.Count > 0)
                    {
                        // Convert DataTable to JSON string
                        var jsonResult = JsonConvert.SerializeObject(dataTable);
                        return Ok(jsonResult);
                    }
                    else
                    {
                        return NotFound("No data found.");
                    }
                }
            }
            catch (Exception ex)
            {
                // Return 500 status code in case of errors
                return StatusCode(500, new { message = ex.Message });
            }
        }



        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirDonationSummary")]
        public IActionResult MandirDonationSummary(int mandirID)
        {
            try
            {
                // Define parameters for the stored procedure
                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@MandirID", mandirID),
           
                };

                // Execute the stored procedure and load results into a DataTable
                using (SqlDataReader dataReader = DataAccess.ExecuteReader(
                    CommandType.StoredProcedure,
                    "MandirDonationSummary",
                    parameters))
                {
                    var dataTable = new DataTable();
                    dataTable.Load(dataReader);

                    if (dataTable.Rows.Count > 0)
                    {
                        // Convert DataTable to JSON string
                        var jsonResult = JsonConvert.SerializeObject(dataTable);
                        return Ok(jsonResult);
                    }
                    else
                    {
                        return NotFound("No data found.");
                    }
                }
            }
            catch (Exception ex)
            {
                // Return 500 status code in case of errors
                return StatusCode(500, new { message = ex.Message });
            }
        }






        [HttpPost]
        [EnableCors("AllowAll")]
        [Route("ProfileEngagementCount_Select")]
        public IActionResult ProfileEngagementCount_Select(int PanditUserID)
        {
            try
            {
                // Define parameters for the stored procedure
                SqlParameter[] parameters = new SqlParameter[]
                {
            new SqlParameter("@PanditUserID", PanditUserID),

                };

                // Execute the stored procedure and load results into a DataTable
                using (SqlDataReader dataReader = DataAccess.ExecuteReader(
                    CommandType.StoredProcedure,
                    "ProfileEngagementCount_Select",
                    parameters))
                {
                    var dataTable = new DataTable();
                    dataTable.Load(dataReader);

                    if (dataTable.Rows.Count > 0)
                    {
                        // Convert DataTable to JSON string
                        var jsonResult = JsonConvert.SerializeObject(dataTable);
                        return Ok(jsonResult);
                    }
                    else
                    {
                        return NotFound("No data found.");
                    }
                }
            }
            catch (Exception ex)
            {
                // Return 500 status code in case of errors
                return StatusCode(500, new { message = ex.Message });
            }
        }









        private MappingDynamicDashboard MakeMappingDynamicDashboard(SqlDataReader dataReader)
        {
            MappingDynamicDashboard dynamicDashboard = new MappingDynamicDashboard();
            dynamicDashboard.DynamicDashboardID = DataAccess.GetInt32(dataReader, "DynamicDashboardID", 0);

            dynamicDashboard.CaptionName = DataAccess.GetString(dataReader, "CaptionName", String.Empty);
            dynamicDashboard.PageUrl = DataAccess.GetString(dataReader, "PageUrl", String.Empty);
            dynamicDashboard.ImageName = DataAccess.GetString(dataReader, "ImageName", String.Empty);

            dynamicDashboard.DynamicDashboardMapID = DataAccess.GetInt32(dataReader, "DynamicDashboardMapID", 0);

            dynamicDashboard.ModuleName = DataAccess.GetString(dataReader, "ModuleName", String.Empty);
            dynamicDashboard.DynamicDashboardStaffMapID = DataAccess.GetInt32(dataReader, "DynamicDashboardStaffMapID", 0);
            dynamicDashboard.ModuleIndex = DataAccess.GetInt32(dataReader, "ModuleIndex", 0);
            dynamicDashboard.DynamicDashboardIndex = DataAccess.GetInt32(dataReader, "DynamicDashboardIndex", 0);

            return dynamicDashboard;
        }


        public class MappingDynamicDashboard
        {
            #region Fields

            private int dynamicDashboardID;

            private string captionName;
            private string pageUrl;
            private string imageName;
            private int dynamicDashboardMapID;
            private string moduleName;
            private int dynamicDashboardStaffMapID;
            private int moduleIndex;
            private int dynamicDashboardIndex;




            #endregion
            #region Properties
            /// <summary>
            /// Gets or sets the DynamicDashboardID value.
            /// </summary>
            public int DynamicDashboardID
            {
                get { return dynamicDashboardID; }
                set { dynamicDashboardID = value; }
            }

            /// <summary>
            /// Gets or sets the CaptionName value.
            /// </summary>
            public string CaptionName
            {
                get { return captionName; }
                set { captionName = value; }
            }

            /// <summary>
            /// Gets or sets the PageUrl value.
            /// </summary>
            public string PageUrl
            {
                get { return pageUrl; }
                set { pageUrl = value; }
            }

            /// <summary>
            /// Gets or sets the ImageName value.
            /// </summary>
            public string ImageName
            {
                get { return imageName; }
                set { imageName = value; }
            }
            /// <summary>
            /// Gets or sets the ImageName value.
            /// </summary>
            public int DynamicDashboardMapID
            {
                get { return dynamicDashboardMapID; }
                set { dynamicDashboardMapID = value; }
            }

            /// <summary>
            /// Gets or sets the ModuleName value.
            /// </summary>
            public string ModuleName
            {
                get { return moduleName; }
                set { moduleName = value; }
            }

            /// Gets or sets the ImageName value.
            /// </summary>
            public int DynamicDashboardStaffMapID
            {
                get { return dynamicDashboardStaffMapID; }
                set { dynamicDashboardStaffMapID = value; }
            }

            /// Gets or sets the ImageName value.
            /// </summary>
            public int ModuleIndex
            {
                get { return moduleIndex; }
                set { moduleIndex = value; }
            }

            /// Gets or sets the ImageName value.
            /// </summary>
            public int DynamicDashboardIndex
            {
                get { return dynamicDashboardIndex; }
                set { dynamicDashboardIndex = value; }
            }


            #endregion

        }


        [HttpGet]
        [EnableCors("AllowAll")]
        [Route("DownloadImages")]
        public IActionResult DownloadImages(string imageName, string imagePurpose)
        {
            try
            {
                var folderPath = getServerPathByPurpose(imagePurpose);
                imageName = imageName == "undefined" ? "uploadfile.png" : imageName;


                Byte[] b = System.IO.File.Exists(@folderPath + imageName) ?
                           System.IO.File.ReadAllBytes(@folderPath + imageName)  //when file exists
                           : System.IO.File.ReadAllBytes(@folderPath + "uploadfile.png");
                return File(b, "image/png");
            }
            catch (Exception err)
            {
                return Ok(err.Message);
            }
        }

        [HttpGet]
        [EnableCors("AllowAll")]
        [Route("DownloadAudio")]
        public IActionResult DownloadAudio(string audioName, string audioPurpose)
        {
            try
            {
                var folderPath = getServerPathByPurpose(audioPurpose);
                audioName = audioName == "undefined" ? "" : audioName;

                if (!System.IO.File.Exists(@folderPath + audioName))
                    return NotFound("Audio file not found");

                byte[] b = System.IO.File.ReadAllBytes(@folderPath + audioName);
                return File(b, "audio/mpeg");   // ← mp3 MIME type
            }
            catch (Exception err)
            {
                return Ok(err.Message);
            }
        }

        private string getServerPathByPurpose(string imagePurpose)
        {
            string PathData = string.Empty;
            if (imagePurpose == "ReportCard")
                PathData = "ClientApp\\dist\\assets\\ReportCard\\";
            if (imagePurpose == "Signature")
                PathData = "ClientApp\\dist\\assets\\Signature\\";
            if (imagePurpose == "RegistrationForm")
                PathData = "ClientApp\\dist\\assets\\RegistrationForm\\";
            if (imagePurpose == "LabourAttendance")
                PathData = "ClientApp\\dist\\assets\\LabourPhoto\\";
            if (imagePurpose == "BatchLabourAttendance")
                PathData = "ClientApp\\dist\\assets\\BatchLabourAttendancePhoto\\";
            if (imagePurpose == "TrainerDocuments")
                PathData = "ClientApp\\dist\\assets\\TrainerDocuments\\";
            if (imagePurpose == "BatchLocation")
                PathData = "ClientApp\\dist\\assets\\BatchLocation\\";
            if (imagePurpose == "LabourImportByMoblizer")
                PathData = "ClientApp\\dist\\assets\\LabourImportByMoblizer\\"; 
            if (imagePurpose == "LabourImportToBatchByAgency")
                PathData = "ClientApp\\dist\\assets\\LabourImportToBatchByAgency\\";
            if (imagePurpose == "ProfilePhoto")
                PathData = "ClientApp\\dist\\assets\\ProfilePhoto\\";
            if (imagePurpose == "PanditService")
                PathData = "ClientApp\\dist\\assets\\PanditService\\";
            if (imagePurpose == "BookingPhoto")
                PathData = "ClientApp\\dist\\assets\\BookingPhoto\\";
            if (imagePurpose == "AartiAudio")
                PathData = "ClientApp\\dist\\assets\\AartiAudio\\";





            return imagePurpose == "logo" ? "Resources\\Logos\\" : PathData;  //check what is purpose of file upload 
        }
    }



    [Route("api/[controller]")]
    [ApiController]
    public class SendEmailerController : Controller
    {
        public SendEmailerController()
        {
            //TODO add the config later.
        }

        [HttpPost]
        [Route("SendEmail")]
        public IActionResult SendEmail(string emailToAddress, string subject, string body)
        {
            using MailMessage mail = new MailMessage();
            mail.From = new MailAddress("rajesh@connecticon.in");
            mail.To.Add(emailToAddress);
            mail.Subject = subject;
            mail.Body = body;
            mail.IsBodyHtml = true;

            SmtpClient smtp = new SmtpClient();
            smtp.Host = "smtp.gmail.com";
            smtp.Port = 587;
            smtp.DeliveryMethod = SmtpDeliveryMethod.Network;
            smtp.UseDefaultCredentials = false;
            smtp.Credentials = new System.Net.NetworkCredential("vedantaerpsales@gmail.com", "hgwuveyrjeehexoo"); // Enter seders User name and password  
            smtp.EnableSsl = true;
            smtp.Send(mail);

            return Ok("Email Operation Completed");
        }

        [EnableCors("AllowAll")]
        [HttpPost]
        [Route("SaveLog")]
        public IActionResult SaveLog([FromBody] LogRequest request)
        {
            if (string.IsNullOrEmpty(request.Message))
                return BadRequest("Log message required!");

            FileLogger.WriteLog(request.Message);

            return Ok(new { Status = "Logged Successfully" });
        }

        public class LogRequest
        {
            public string Message { get; set; }
        }

       




    }
}
