using System;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Data.SqlTypes;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using FaceUPAI.Models;
using FaceUPAI.DataAccessService;
using FaceUPAI.Controllers.Common;
using Microsoft.AspNetCore.Cors;

namespace FaceUPAI.API
{
	public class ChatGroupParticipantAPI : ControllerBase
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
		/// Saves a record to the ChatGroupParticipants table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupParticipantsInsert")]
		public  IActionResult ChatGroupParticipantsInsert([FromBody] ChatGroupParticipant chatGroupParticipant)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ChatGroupID", chatGroupParticipant.ChatGroupID == 0 ? SqlInt32.Null : chatGroupParticipant.ChatGroupID ),
				new SqlParameter("@UserID", chatGroupParticipant.UserID == 0 ? SqlInt32.Null : chatGroupParticipant.UserID ),
				new SqlParameter("@JoinedAt", chatGroupParticipant.JoinedAt == DateTime.MinValue ? SqlDateTime.Null : chatGroupParticipant.JoinedAt )
			};

			chatGroupParticipant.ChatGroupParticipantsID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ChatGroupParticipantsInsert", parameters));
			return Ok(new {ChatGroupParticipantsID=chatGroupParticipant.ChatGroupParticipantsID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the ChatGroupParticipants table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupParticipantsUpdate")]
		public  IActionResult ChatGroupParticipantsUpdate([FromBody] ChatGroupParticipant chatGroupParticipant)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ChatGroupParticipantsID", chatGroupParticipant.ChatGroupParticipantsID == 0 ? SqlInt32.Null : chatGroupParticipant.ChatGroupParticipantsID ),
				new SqlParameter("@ChatGroupID", chatGroupParticipant.ChatGroupID == 0 ? SqlInt32.Null : chatGroupParticipant.ChatGroupID ),
				new SqlParameter("@UserID", chatGroupParticipant.UserID == 0 ? SqlInt32.Null : chatGroupParticipant.UserID ),
				new SqlParameter("@JoinedAt", chatGroupParticipant.JoinedAt == DateTime.MinValue ? SqlDateTime.Null : chatGroupParticipant.JoinedAt )
			};

			 var ChatGroupParticipantID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ChatGroupParticipantsUpdate", parameters));
			return Ok(new {ChatGroupParticipantID =ChatGroupParticipantID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the ChatGroupParticipants table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupParticipantsDelete")]
		public  IActionResult ChatGroupParticipantsDelete(int chatGroupParticipantsID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ChatGroupParticipantsID", chatGroupParticipantsID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var chatGroupParticipantsDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ChatGroupParticipantsDelete", parameters));
			return Ok(new {ChatGroupParticipantsID =chatGroupParticipantsDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ChatGroupParticipants table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupParticipantSelect")]
		public IActionResult ChatGroupParticipantSelect(int chatGroupParticipantsID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ChatGroupParticipantsID", chatGroupParticipantsID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ChatGroupParticipantsSelect", parameters))
			{
				List<ChatGroupParticipant> ChatGroupParticipantList = new List<ChatGroupParticipant>();
				while (dataReader.Read())
				{
					ChatGroupParticipant ChatGroupParticipant = MakeChatGroupParticipant(dataReader);
					ChatGroupParticipantList.Add(ChatGroupParticipant);
				}

				return  Ok(new {ChatGroupParticipantList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ChatGroupParticipants table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupParticipantSelectAll")]
		public IActionResult ChatGroupParticipantSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ChatGroupParticipantsSelectAll", parameters))
			{
				List<ChatGroupParticipant> ChatGroupParticipantList = new List<ChatGroupParticipant>();
				while (dataReader.Read())
				{
					ChatGroupParticipant ChatGroupParticipant = MakeChatGroupParticipant(dataReader);
					ChatGroupParticipantList.Add(ChatGroupParticipant);
				}

				return  Ok(new {ChatGroupParticipantList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the ChatGroupParticipants table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupParticipantsSelectAllByChatGroupID")]
		public  IActionResult ChatGroupParticipantsSelectAllByChatGroupID(int chatGroupID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ChatGroupID", chatGroupID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ChatGroupParticipantsSelectAllByChatGroupID", parameters))
			{
				List<ChatGroupParticipant> ChatGroupParticipantList = new List<ChatGroupParticipant>();
				while (dataReader.Read())
				{
					ChatGroupParticipant ChatGroupParticipant = MakeChatGroupParticipant(dataReader);
					ChatGroupParticipantList.Add(ChatGroupParticipant);
				}

				return  Ok(new {ChatGroupParticipantList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the ChatGroupParticipants table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupParticipantsSelectAllByUserID")]
		public  IActionResult ChatGroupParticipantsSelectAllByUserID(int userID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserID", userID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ChatGroupParticipantsSelectAllByUserID", parameters))
			{
				List<ChatGroupParticipant> ChatGroupParticipantList = new List<ChatGroupParticipant>();
				while (dataReader.Read())
				{
					ChatGroupParticipant ChatGroupParticipant = MakeChatGroupParticipant(dataReader);
					ChatGroupParticipantList.Add(ChatGroupParticipant);
				}

				return  Ok(new {ChatGroupParticipantList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the ChatGroupParticipants table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupParticipantsSelectByQuery")]
		public  IActionResult ChatGroupParticipantsSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ChatGroupParticipantsSelectByQuery", parameters))
			{
				List<ChatGroupParticipant> ChatGroupParticipantList = new List<ChatGroupParticipant>();
				while (dataReader.Read())
				{
					ChatGroupParticipant ChatGroupParticipant = MakeChatGroupParticipant(dataReader);
					ChatGroupParticipantList.Add(ChatGroupParticipant);
				}

				return  Ok(new {ChatGroupParticipantList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the ChatGroupParticipants class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  ChatGroupParticipant MakeChatGroupParticipant(SqlDataReader dataReader)
		{
			ChatGroupParticipant chatGroupParticipant = new ChatGroupParticipant();
			chatGroupParticipant.ChatGroupParticipantsID = DataAccess.GetInt32(dataReader, "ChatGroupParticipantsID", 0);
			chatGroupParticipant.ChatGroupID = DataAccess.GetInt32(dataReader, "ChatGroupID", 0);
			chatGroupParticipant.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			chatGroupParticipant.JoinedAt = DataAccess.GetDateTime(dataReader, "JoinedAt", DateTime.MinValue);

			return chatGroupParticipant;
		}

	}
	}
