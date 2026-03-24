using FaceUPAI.DataAccessService;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System;
using System.Data;

namespace FaceUPAI.API
{
    [ApiController] 
    public class MappingController : ControllerBase
    {
        [HttpPost]
        [Route("CheckExistence")]
        public IActionResult CheckExistence(string mappingTable, int entityId1, int entityId2, string column1, string column2)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@mappingTable", mappingTable),
                new SqlParameter("@entityId1", entityId1),
                new SqlParameter("@entityId2", entityId2),
                new SqlParameter("@column1", column1),
                new SqlParameter("@column2", column2)
            };
            bool exists = Convert.ToBoolean(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "CheckMappingExistence", parameters));
            return Ok(new { Exists = exists });
        }

        [HttpPost]
        [Route("AddMapping")]
        public IActionResult AddMapping(string mappingTable, int entityId1, int entityId2, string column1, string column2)
        {
            SqlParameter[] parameters = new SqlParameter[]
            {
                new SqlParameter("@mappingTable", mappingTable),
                new SqlParameter("@entityId1", entityId1),
                new SqlParameter("@entityId2", entityId2),
                new SqlParameter("@column1", column1),
                new SqlParameter("@column2", column2)
            };
            //DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "AddMapping", parameters);
            var key = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "AddMapping", parameters));
            return Ok(new { Success = key });
        }

        [HttpPost]
        [Route("RemoveMapping")]
        public IActionResult RemoveMapping(string mappingTable, int entityId1, int entityId2, string column1, string column2)
        {
            SqlParameter[] parameters = new SqlParameter[]
           {
                new SqlParameter("@mappingTable", mappingTable),
                new SqlParameter("@entityId1", entityId1),
                new SqlParameter("@entityId2", entityId2),
                new SqlParameter("@column1", column1),
                new SqlParameter("@column2", column2)
           };
            DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "RemoveMapping", parameters);
            return Ok(new { Success = true });
        }
    }
}
