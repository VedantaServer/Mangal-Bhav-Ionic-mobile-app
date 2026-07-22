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
	public class NotificationQueueAPI : ControllerBase
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
		/// Saves a record to the NotificationQueue table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("NotificationQueueInsert")]
		public  IActionResult NotificationQueueInsert([FromBody] NotificationQueue notificationQueue)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserID", notificationQueue.UserID == 0 ? SqlInt32.Null : notificationQueue.UserID ),
				new SqlParameter("@Title", notificationQueue.Title),
				new SqlParameter("@Message", notificationQueue.Message),
				new SqlParameter("@NotificationType", notificationQueue.NotificationType),
				new SqlParameter("@CreatedDate", notificationQueue.CreatedDate == DateTime.MinValue ? SqlDateTime.Null : notificationQueue.CreatedDate ),
				new SqlParameter("@SentDate", notificationQueue.SentDate == DateTime.MinValue ? SqlDateTime.Null : notificationQueue.SentDate ),
				new SqlParameter("@IsSent", notificationQueue.IsSent),
				new SqlParameter("@IsSeen", notificationQueue.IsSeen),
				new SqlParameter("@FirebaseResponse", notificationQueue.FirebaseResponse),
				new SqlParameter("@ErrorMessage", notificationQueue.ErrorMessage),
				new SqlParameter("@ReferenceID", notificationQueue.ReferenceID == 0 ? SqlInt32.Null : notificationQueue.ReferenceID )
			};

			notificationQueue.ID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "NotificationQueueInsert", parameters));
			return Ok(new {ID=notificationQueue.ID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the NotificationQueue table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("NotificationQueueUpdate")]
		public  IActionResult NotificationQueueUpdate([FromBody] NotificationQueue notificationQueue)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ID", notificationQueue.ID == 0 ? SqlInt32.Null : notificationQueue.ID ),
				new SqlParameter("@UserID", notificationQueue.UserID == 0 ? SqlInt32.Null : notificationQueue.UserID ),
				new SqlParameter("@Title", notificationQueue.Title),
				new SqlParameter("@Message", notificationQueue.Message),
				new SqlParameter("@NotificationType", notificationQueue.NotificationType),
				new SqlParameter("@CreatedDate", notificationQueue.CreatedDate == DateTime.MinValue ? SqlDateTime.Null : notificationQueue.CreatedDate ),
				new SqlParameter("@SentDate", notificationQueue.SentDate == DateTime.MinValue ? SqlDateTime.Null : notificationQueue.SentDate ),
				new SqlParameter("@IsSent", notificationQueue.IsSent),
				new SqlParameter("@IsSeen", notificationQueue.IsSeen),
				new SqlParameter("@FirebaseResponse", notificationQueue.FirebaseResponse),
				new SqlParameter("@ErrorMessage", notificationQueue.ErrorMessage),
				new SqlParameter("@ReferenceID", notificationQueue.ReferenceID == 0 ? SqlInt32.Null : notificationQueue.ReferenceID )
			};

			 var NotificationQueueID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "NotificationQueueUpdate", parameters));
			return Ok(new {NotificationQueueID =NotificationQueueID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the NotificationQueue table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("NotificationQueueDelete")]
		public  IActionResult NotificationQueueDelete(int iD, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ID", iD)

				,new SqlParameter("@TenantID", tenantID)			};

			 var notificationQueueDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "NotificationQueueDelete", parameters));
			return Ok(new {NotificationQueueID =notificationQueueDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the NotificationQueue table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("NotificationQueueSelect")]
		public IActionResult NotificationQueueSelect(int iD,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ID", iD)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "NotificationQueueSelect", parameters))
			{
				List<NotificationQueue> NotificationQueueList = new List<NotificationQueue>();
				while (dataReader.Read())
				{
					NotificationQueue NotificationQueue = MakeNotificationQueue(dataReader);
					NotificationQueueList.Add(NotificationQueue);
				}

				return  Ok(new {NotificationQueueList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the NotificationQueue table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("NotificationQueueSelectAll")]
		public IActionResult NotificationQueueSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "NotificationQueueSelectAll", parameters))
			{
				List<NotificationQueue> NotificationQueueList = new List<NotificationQueue>();
				while (dataReader.Read())
				{
					NotificationQueue NotificationQueue = MakeNotificationQueue(dataReader);
					NotificationQueueList.Add(NotificationQueue);
				}

				return  Ok(new {NotificationQueueList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the NotificationQueue table by a ak=ll query.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("NotificationQueueSelectByQuery")]
		public  IActionResult NotificationQueueSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "NotificationQueueSelectByQuery", parameters))
			{
				List<NotificationQueue> NotificationQueueList = new List<NotificationQueue>();
				while (dataReader.Read())
				{
					NotificationQueue NotificationQueue = MakeNotificationQueue(dataReader);
					NotificationQueueList.Add(NotificationQueue);
				}

				return  Ok(new {NotificationQueueList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the NotificationQueue class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  NotificationQueue MakeNotificationQueue(SqlDataReader dataReader)
		{
			NotificationQueue notificationQueue = new NotificationQueue();
			notificationQueue.ID = DataAccess.GetInt32(dataReader, "ID", 0);
			notificationQueue.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			notificationQueue.Title = DataAccess.GetString(dataReader, "Title", String.Empty);
			notificationQueue.Message = DataAccess.GetString(dataReader, "Message", String.Empty);
			notificationQueue.NotificationType = DataAccess.GetString(dataReader, "NotificationType", String.Empty);
			notificationQueue.CreatedDate = DataAccess.GetDateTime(dataReader, "CreatedDate", DateTime.MinValue);
			notificationQueue.SentDate = DataAccess.GetDateTime(dataReader, "SentDate", DateTime.MinValue);
			notificationQueue.IsSent = DataAccess.GetBoolean(dataReader, "IsSent", false);
			notificationQueue.IsSeen = DataAccess.GetBoolean(dataReader, "IsSeen", false);
			notificationQueue.FirebaseResponse = DataAccess.GetString(dataReader, "FirebaseResponse", String.Empty);
			notificationQueue.ErrorMessage = DataAccess.GetString(dataReader, "ErrorMessage", String.Empty);
			notificationQueue.ReferenceID = DataAccess.GetInt32(dataReader, "ReferenceID", 0);

			return notificationQueue;
		}

	}
	}
