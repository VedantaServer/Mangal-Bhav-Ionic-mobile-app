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
	public class MessageAPI : ControllerBase
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
		/// Saves a record to the Messages table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MessagesInsert")]
		public  IActionResult MessagesInsert([FromBody] Message message)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ChatGroupID", message.ChatGroupID == 0 ? SqlInt32.Null : message.ChatGroupID ),
				new SqlParameter("@ChatType", message.ChatType),
				new SqlParameter("@SenderID", message.SenderID == 0 ? SqlInt32.Null : message.SenderID ),
				new SqlParameter("@ReceiverID", message.ReceiverID == 0 ? SqlInt32.Null : message.ReceiverID ),
				new SqlParameter("@MessageText", message.MessageText),
				new SqlParameter("@MessageType", message.MessageType),
				new SqlParameter("@MediaURL", message.MediaURL),
				new SqlParameter("@SentAt", message.SentAt == DateTime.MinValue ? SqlDateTime.Null : message.SentAt ),
				new SqlParameter("@IsDeleted", message.IsDeleted)
			};

			message.MessageID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MessagesInsert", parameters));
			return Ok(new {MessageID=message.MessageID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the Messages table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MessagesUpdate")]
		public  IActionResult MessagesUpdate([FromBody] Message message)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MessageID", message.MessageID == 0 ? SqlInt32.Null : message.MessageID ),
				new SqlParameter("@ChatGroupID", message.ChatGroupID == 0 ? SqlInt32.Null : message.ChatGroupID ),
				new SqlParameter("@ChatType", message.ChatType),
				new SqlParameter("@SenderID", message.SenderID == 0 ? SqlInt32.Null : message.SenderID ),
				new SqlParameter("@ReceiverID", message.ReceiverID == 0 ? SqlInt32.Null : message.ReceiverID ),
				new SqlParameter("@MessageText", message.MessageText),
				new SqlParameter("@MessageType", message.MessageType),
				new SqlParameter("@MediaURL", message.MediaURL),
				new SqlParameter("@SentAt", message.SentAt == DateTime.MinValue ? SqlDateTime.Null : message.SentAt ),
				new SqlParameter("@IsDeleted", message.IsDeleted)
			};

			 var MessageID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "MessagesUpdate", parameters));
			return Ok(new {MessageID =MessageID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the Messages table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MessagesDelete")]
		public  IActionResult MessagesDelete(int messageID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MessageID", messageID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var messagesDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MessagesDelete", parameters));
			return Ok(new {MessagesID =messagesDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Messages table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MessageSelect")]
		public IActionResult MessageSelect(int messageID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MessageID", messageID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MessagesSelect", parameters))
			{
				List<Message> MessageList = new List<Message>();
				while (dataReader.Read())
				{
					Message Message = MakeMessage(dataReader);
					MessageList.Add(Message);
				}

				return  Ok(new {MessageList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Messages table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MessageSelectAll")]
		public IActionResult MessageSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MessagesSelectAll", parameters))
			{
				List<Message> MessageList = new List<Message>();
				while (dataReader.Read())
				{
					Message Message = MakeMessage(dataReader);
					MessageList.Add(Message);
				}

				return  Ok(new {MessageList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the Messages table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MessagesSelectAllByChatGroupID")]
		public  IActionResult MessagesSelectAllByChatGroupID(int chatGroupID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ChatGroupID", chatGroupID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MessagesSelectAllByChatGroupID", parameters))
			{
				List<Message> MessageList = new List<Message>();
				while (dataReader.Read())
				{
					Message Message = MakeMessage(dataReader);
					MessageList.Add(Message);
				}

				return  Ok(new {MessageList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the Messages table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MessagesSelectAllBySenderID")]
		public  IActionResult MessagesSelectAllBySenderID(int senderID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@SenderID", senderID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MessagesSelectAllBySenderID", parameters))
			{
				List<Message> MessageList = new List<Message>();
				while (dataReader.Read())
				{
					Message Message = MakeMessage(dataReader);
					MessageList.Add(Message);
				}

				return  Ok(new {MessageList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the Messages table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MessagesSelectAllByReceiverID")]
		public  IActionResult MessagesSelectAllByReceiverID(int receiverID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ReceiverID", receiverID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MessagesSelectAllByReceiverID", parameters))
			{
				List<Message> MessageList = new List<Message>();
				while (dataReader.Read())
				{
					Message Message = MakeMessage(dataReader);
					MessageList.Add(Message);
				}

				return  Ok(new {MessageList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the Messages table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MessagesSelectByQuery")]
		public  IActionResult MessagesSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MessagesSelectByQuery", parameters))
			{
				List<Message> MessageList = new List<Message>();
				while (dataReader.Read())
				{
					Message Message = MakeMessage(dataReader);
					MessageList.Add(Message);
				}

				return  Ok(new {MessageList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the Messages class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  Message MakeMessage(SqlDataReader dataReader)
		{
			Message message = new Message();
			message.MessageID = DataAccess.GetInt32(dataReader, "MessageID", 0);
			message.ChatGroupID = DataAccess.GetInt32(dataReader, "ChatGroupID", 0);
			message.ChatType = DataAccess.GetString(dataReader, "ChatType", String.Empty);
			message.SenderID = DataAccess.GetInt32(dataReader, "SenderID", 0);
			message.ReceiverID = DataAccess.GetInt32(dataReader, "ReceiverID", 0);
			message.MessageText = DataAccess.GetString(dataReader, "MessageText", String.Empty);
			message.MessageType = DataAccess.GetString(dataReader, "MessageType", String.Empty);
			message.MediaURL = DataAccess.GetString(dataReader, "MediaURL", String.Empty);
			message.SentAt = DataAccess.GetDateTime(dataReader, "SentAt", DateTime.MinValue);
			message.IsDeleted = DataAccess.GetBoolean(dataReader, "IsDeleted", false);

			return message;
		}

	}
	}
