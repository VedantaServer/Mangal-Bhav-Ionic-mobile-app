using FaceUPAI.Controllers.Common;
using FaceUPAI.DataAccessService;
using FaceUPAI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlTypes;

namespace FaceUPAI.API
{
	public class MandirEventAPI : ControllerBase
	{
	public IActionResult Index()
	{
	return View();
	}
	private IActionResult View()
	{
	throw new NotImplementedException();
	}
		/// <summary>
		/// Saves a record to the MandirEvent table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirEventInsert")]
		public  IActionResult MandirEventInsert([FromBody] MandirEvent mandirEvent)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirEventID", mandirEvent.MandirEventID == 0 ? SqlInt32.Null : mandirEvent.MandirEventID ),
				new SqlParameter("@TenantID", mandirEvent.TenantID == 0 ? SqlInt32.Null : mandirEvent.TenantID ),
				new SqlParameter("@MandirID", mandirEvent.MandirID == 0 ? SqlInt32.Null : mandirEvent.MandirID ),
				new SqlParameter("@EventType", mandirEvent.EventType),
				new SqlParameter("@EventName", mandirEvent.EventName),
				new SqlParameter("@EventDescription", mandirEvent.EventDescription),
				new SqlParameter("@EventOrganizerName1", mandirEvent.EventOrganizerName1),
				new SqlParameter("@EventOrganizerName2", mandirEvent.EventOrganizerName2),
				new SqlParameter("@EventOrganizerPhone1", mandirEvent.EventOrganizerPhone1),
				new SqlParameter("@EventOrganizerPhone2", mandirEvent.EventOrganizerPhone2),
				new SqlParameter("@EventCardPhoto1", mandirEvent.EventCardPhoto1),
				new SqlParameter("@EventCardPhoto2", mandirEvent.EventCardPhoto2),
				new SqlParameter("@EventDate", mandirEvent.EventDate),
				new SqlParameter("@EventTime", mandirEvent.EventTime),
				new SqlParameter("@EventDay", mandirEvent.EventDay),
				new SqlParameter("@EventStatus", mandirEvent.EventStatus),
				new SqlParameter("@IsVerified", mandirEvent.IsVerified),
				new SqlParameter("@AdminRemarks", mandirEvent.AdminRemarks),
				new SqlParameter("@AddedByMandirMemberID", mandirEvent.AddedByMandirMemberID == 0 ? SqlInt32.Null : mandirEvent.AddedByMandirMemberID ),
				new SqlParameter("@DateAdded", mandirEvent.DateAdded == DateTime.MinValue ? SqlDateTime.Null : mandirEvent.DateAdded ),
				new SqlParameter("@DateModified", mandirEvent.DateModified == DateTime.MinValue ? SqlDateTime.Null : mandirEvent.DateModified ),
				new SqlParameter("@UpdatedByUser", mandirEvent.UpdatedByUser)
			};

			return Ok(DataAccess.ExecuteNonQuery(System.Data.CommandType.StoredProcedure, "MandirEventInsert", parameters));
			}, this);
		}

		/// <summary>
		/// Updates a record in the MandirEvent table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirEventUpdate")]
		public  IActionResult MandirEventUpdate([FromBody] MandirEvent mandirEvent)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirEventID", mandirEvent.MandirEventID == 0 ? SqlInt32.Null : mandirEvent.MandirEventID ),
				new SqlParameter("@TenantID", mandirEvent.TenantID == 0 ? SqlInt32.Null : mandirEvent.TenantID ),
				new SqlParameter("@MandirID", mandirEvent.MandirID == 0 ? SqlInt32.Null : mandirEvent.MandirID ),
				new SqlParameter("@EventType", mandirEvent.EventType),
				new SqlParameter("@EventName", mandirEvent.EventName),
				new SqlParameter("@EventDescription", mandirEvent.EventDescription),
				new SqlParameter("@EventOrganizerName1", mandirEvent.EventOrganizerName1),
				new SqlParameter("@EventOrganizerName2", mandirEvent.EventOrganizerName2),
				new SqlParameter("@EventOrganizerPhone1", mandirEvent.EventOrganizerPhone1),
				new SqlParameter("@EventOrganizerPhone2", mandirEvent.EventOrganizerPhone2),
				new SqlParameter("@EventCardPhoto1", mandirEvent.EventCardPhoto1),
				new SqlParameter("@EventCardPhoto2", mandirEvent.EventCardPhoto2),
				new SqlParameter("@EventDate", mandirEvent.EventDate),
				new SqlParameter("@EventTime", mandirEvent.EventTime),
				new SqlParameter("@EventDay", mandirEvent.EventDay),
				new SqlParameter("@EventStatus", mandirEvent.EventStatus),
				new SqlParameter("@IsVerified", mandirEvent.IsVerified),
				new SqlParameter("@AdminRemarks", mandirEvent.AdminRemarks),
				new SqlParameter("@AddedByMandirMemberID", mandirEvent.AddedByMandirMemberID == 0 ? SqlInt32.Null : mandirEvent.AddedByMandirMemberID ),
				new SqlParameter("@DateAdded", mandirEvent.DateAdded == DateTime.MinValue ? SqlDateTime.Null : mandirEvent.DateAdded ),
				new SqlParameter("@DateModified", mandirEvent.DateModified == DateTime.MinValue ? SqlDateTime.Null : mandirEvent.DateModified ),
				new SqlParameter("@UpdatedByUser", mandirEvent.UpdatedByUser)
			};

			 var MandirEventID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "MandirEventUpdate", parameters));
			return Ok(new {MandirEventID =MandirEventID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the MandirEvent table by its primary key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirEventDelete")]
		public  IActionResult MandirEventDelete(int mandirEventID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirEventID", mandirEventID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var mandirEventDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MandirEventDelete", parameters));
			return Ok(new {MandirEventID =mandirEventDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the MandirEvent table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirEventSelect")]
		public IActionResult MandirEventSelect(int mandirEventID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirEventID", mandirEventID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MandirEventSelect", parameters))
			{
				List<MandirEvent> MandirEventList = new List<MandirEvent>();
				while (dataReader.Read())
				{
					MandirEvent MandirEvent = MakeMandirEvent(dataReader);
					MandirEventList.Add(MandirEvent);
				}

				return  Ok(new {MandirEventList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the MandirEvent table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirEventSelectAll")]
		public IActionResult MandirEventSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MandirEventSelectAll", parameters))
			{
				List<MandirEvent> MandirEventList = new List<MandirEvent>();
				while (dataReader.Read())
				{
					MandirEvent MandirEvent = MakeMandirEvent(dataReader);
					MandirEventList.Add(MandirEvent);
				}

				return  Ok(new {MandirEventList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the MandirEvent table by a foreign key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirEventSelectAllByMandirID")]
		public  IActionResult MandirEventSelectAllByMandirID(int mandirID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirID", mandirID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MandirEventSelectAllByMandirID", parameters))
			{
				List<MandirEvent> MandirEventList = new List<MandirEvent>();
				while (dataReader.Read())
				{
					MandirEvent MandirEvent = MakeMandirEvent(dataReader);
					MandirEventList.Add(MandirEvent);
				}

				return  Ok(new {MandirEventList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the MandirEvent table by a foreign key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirEventSelectAllByAddedByMandirMemberID")]
		public  IActionResult MandirEventSelectAllByAddedByMandirMemberID(int addedByMandirMemberID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@AddedByMandirMemberID", addedByMandirMemberID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MandirEventSelectAllByAddedByMandirMemberID", parameters))
			{
				List<MandirEvent> MandirEventList = new List<MandirEvent>();
				while (dataReader.Read())
				{
					MandirEvent MandirEvent = MakeMandirEvent(dataReader);
					MandirEventList.Add(MandirEvent);
				}

				return  Ok(new {MandirEventList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the MandirEvent table by a foreign key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirEventSelectAllByTenantID")]
		public  IActionResult MandirEventSelectAllByTenantID(int tenantID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MandirEventSelectAllByTenantID", parameters))
			{
				List<MandirEvent> MandirEventList = new List<MandirEvent>();
				while (dataReader.Read())
				{
					MandirEvent MandirEvent = MakeMandirEvent(dataReader);
					MandirEventList.Add(MandirEvent);
				}

				return  Ok(new {MandirEventList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the MandirEvent table by a ak=ll query.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirEventSelectByQuery")]
		public  IActionResult MandirEventSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MandirEventSelectByQuery", parameters))
			{
				List<MandirEvent> MandirEventList = new List<MandirEvent>();
				while (dataReader.Read())
				{
					MandirEvent MandirEvent = MakeMandirEvent(dataReader);
					MandirEventList.Add(MandirEvent);
				}

				return  Ok(new {MandirEventList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the MandirEvent class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  MandirEvent MakeMandirEvent(SqlDataReader dataReader)
		{
			MandirEvent mandirEvent = new MandirEvent();
			mandirEvent.MandirEventID = DataAccess.GetInt32(dataReader, "MandirEventID", 0);
			mandirEvent.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			mandirEvent.MandirID = DataAccess.GetInt32(dataReader, "MandirID", 0);
			mandirEvent.EventType = DataAccess.GetString(dataReader, "EventType", String.Empty);
			mandirEvent.EventName = DataAccess.GetString(dataReader, "EventName", String.Empty);
			mandirEvent.EventDescription = DataAccess.GetString(dataReader, "EventDescription", String.Empty);
			mandirEvent.EventOrganizerName1 = DataAccess.GetString(dataReader, "EventOrganizerName1", String.Empty);
			mandirEvent.EventOrganizerName2 = DataAccess.GetString(dataReader, "EventOrganizerName2", String.Empty);
			mandirEvent.EventOrganizerPhone1 = DataAccess.GetString(dataReader, "EventOrganizerPhone1", String.Empty);
			mandirEvent.EventOrganizerPhone2 = DataAccess.GetString(dataReader, "EventOrganizerPhone2", String.Empty);
			mandirEvent.EventCardPhoto1 = DataAccess.GetString(dataReader, "EventCardPhoto1", String.Empty);
			mandirEvent.EventCardPhoto2 = DataAccess.GetString(dataReader, "EventCardPhoto2", String.Empty);
			mandirEvent.EventDate = DataAccess.GetString(dataReader, "EventDate", String.Empty);
			mandirEvent.EventTime = DataAccess.GetString(dataReader, "EventTime", String.Empty);
			mandirEvent.EventDay = DataAccess.GetString(dataReader, "EventDay", String.Empty);
			mandirEvent.EventStatus = DataAccess.GetString(dataReader, "EventStatus", String.Empty);
			mandirEvent.IsVerified = DataAccess.GetBoolean(dataReader, "IsVerified", false);
			mandirEvent.AdminRemarks = DataAccess.GetString(dataReader, "AdminRemarks", String.Empty);
			mandirEvent.AddedByMandirMemberID = DataAccess.GetInt32(dataReader, "AddedByMandirMemberID", 0);
			mandirEvent.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			mandirEvent.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			mandirEvent.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return mandirEvent;
		}

	}
	}
