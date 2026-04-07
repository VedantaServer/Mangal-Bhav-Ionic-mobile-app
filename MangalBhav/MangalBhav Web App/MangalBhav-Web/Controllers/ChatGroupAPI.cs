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
	public class ChatGroupAPI : ControllerBase
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
		/// Saves a record to the ChatGroup table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupInsert")]
		public  IActionResult ChatGroupInsert([FromBody] ChatGroup chatGroup)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@GroupName", chatGroup.GroupName),
				new SqlParameter("@CreatedBy", chatGroup.CreatedBy == 0 ? SqlInt32.Null : chatGroup.CreatedBy ),
				new SqlParameter("@CreatedAt", chatGroup.CreatedAt == DateTime.MinValue ? SqlDateTime.Null : chatGroup.CreatedAt )
			};

			chatGroup.ChatGroupID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ChatGroupInsert", parameters));
			return Ok(new {ChatGroupID=chatGroup.ChatGroupID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the ChatGroup table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupUpdate")]
		public  IActionResult ChatGroupUpdate([FromBody] ChatGroup chatGroup)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ChatGroupID", chatGroup.ChatGroupID == 0 ? SqlInt32.Null : chatGroup.ChatGroupID ),
				new SqlParameter("@GroupName", chatGroup.GroupName),
				new SqlParameter("@CreatedBy", chatGroup.CreatedBy == 0 ? SqlInt32.Null : chatGroup.CreatedBy ),
				new SqlParameter("@CreatedAt", chatGroup.CreatedAt == DateTime.MinValue ? SqlDateTime.Null : chatGroup.CreatedAt )
			};

			 var ChatGroupID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ChatGroupUpdate", parameters));
			return Ok(new {ChatGroupID =ChatGroupID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the ChatGroup table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupDelete")]
		public  IActionResult ChatGroupDelete(int chatGroupID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ChatGroupID", chatGroupID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var chatGroupDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ChatGroupDelete", parameters));
			return Ok(new {ChatGroupID =chatGroupDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ChatGroup table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupSelect")]
		public IActionResult ChatGroupSelect(int chatGroupID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ChatGroupID", chatGroupID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ChatGroupSelect", parameters))
			{
				List<ChatGroup> ChatGroupList = new List<ChatGroup>();
				while (dataReader.Read())
				{
					ChatGroup ChatGroup = MakeChatGroup(dataReader);
					ChatGroupList.Add(ChatGroup);
				}

				return  Ok(new {ChatGroupList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ChatGroup table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupSelectAll")]
		public IActionResult ChatGroupSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ChatGroupSelectAll", parameters))
			{
				List<ChatGroup> ChatGroupList = new List<ChatGroup>();
				while (dataReader.Read())
				{
					ChatGroup ChatGroup = MakeChatGroup(dataReader);
					ChatGroupList.Add(ChatGroup);
				}

				return  Ok(new {ChatGroupList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the ChatGroup table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupSelectAllByCreatedBy")]
		public  IActionResult ChatGroupSelectAllByCreatedBy(int createdBy)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@CreatedBy", createdBy)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ChatGroupSelectAllByCreatedBy", parameters))
			{
				List<ChatGroup> ChatGroupList = new List<ChatGroup>();
				while (dataReader.Read())
				{
					ChatGroup ChatGroup = MakeChatGroup(dataReader);
					ChatGroupList.Add(ChatGroup);
				}

				return  Ok(new {ChatGroupList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the ChatGroup table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ChatGroupSelectByQuery")]
		public  IActionResult ChatGroupSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ChatGroupSelectByQuery", parameters))
			{
				List<ChatGroup> ChatGroupList = new List<ChatGroup>();
				while (dataReader.Read())
				{
					ChatGroup ChatGroup = MakeChatGroup(dataReader);
					ChatGroupList.Add(ChatGroup);
				}

				return  Ok(new {ChatGroupList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the ChatGroup class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  ChatGroup MakeChatGroup(SqlDataReader dataReader)
		{
			ChatGroup chatGroup = new ChatGroup();
			chatGroup.ChatGroupID = DataAccess.GetInt32(dataReader, "ChatGroupID", 0);
			chatGroup.GroupName = DataAccess.GetString(dataReader, "GroupName", String.Empty);
			chatGroup.CreatedBy = DataAccess.GetInt32(dataReader, "CreatedBy", 0);
			chatGroup.CreatedAt = DataAccess.GetDateTime(dataReader, "CreatedAt", DateTime.MinValue);

			return chatGroup;
		}

	}
	}
