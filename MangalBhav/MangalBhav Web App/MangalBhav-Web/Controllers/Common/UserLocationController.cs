using FaceUPAI.DataAccessService;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Data.SqlTypes;

namespace FaceUPAI.Controllers.Common
{
    public class UserLocationController : Controller
    {
        /// <summary>
        /// Checks for nearby mandirs for a given user location and queues
        /// notifications for any matches (deduped over the last 24 hours).
        /// </summary>
        [HttpPost]
        [EnableCors("AllowAll")]
        public IActionResult CheckNearbyMandir([FromBody] NearbyMandirRequest request)
        {
            if (request == null)
                return BadRequest("Request body is required.");

            if (request.UserId <= 0)
                return BadRequest("A valid UserId is required.");

            if (request.Lat < -90 || request.Lat > 90 || request.Lng < -180 || request.Lng > 180)
                return BadRequest("Lat/Lng are out of valid range.");


            return ApiHandler.Handle(() =>
            {
                SqlParameter[] parameters = new SqlParameter[]
                {
                new SqlParameter("@UserId", request.UserId == 0 ? SqlInt32.Null : request.UserId),
                new SqlParameter("@Lat", request.Lat),
                new SqlParameter("@Lng", request.Lng),
                new SqlParameter("@RadiusKm", request.RadiusKm == null ? SqlDouble.Null : request.RadiusKm)
                };
                DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "sp_CheckNearbyMandirAndNotify", parameters);
                return Ok(new { message = "Nearby mandir check completed." });
            }, this);
        }

        // Add sibling actions here as more entities come online, e.g.:
        // [HttpPost]
        // public IActionResult CheckNearbyPandit([FromBody] NearbyPanditRequest request) { ... }
        // [HttpPost]
        // public IActionResult CheckNearbyEvent([FromBody] NearbyEventRequest request) { ... }
    }

    public class NearbyMandirRequest
    {
        public int UserId { get; set; }
        public double Lat { get; set; }
        public double Lng { get; set; }
        public double? RadiusKm { get; set; }
    }
}