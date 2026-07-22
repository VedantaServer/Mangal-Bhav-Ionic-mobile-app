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
	public class FeedCommentAPI : ControllerBase
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
		/// Saves a record to the FeedComment table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedCommentInsert")]
		public  IActionResult FeedCommentInsert([FromBody] FeedComment feedComment)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedID", feedComment.FeedID == 0 ? SqlInt32.Null : feedComment.FeedID ),
				new SqlParameter("@UserID", feedComment.UserID == 0 ? SqlInt32.Null : feedComment.UserID ),
				new SqlParameter("@Comment", feedComment.Comment),
				new SqlParameter("@IsDeleted", feedComment.IsDeleted),
				new SqlParameter("@DateAdded", feedComment.DateAdded == DateTime.MinValue ? SqlDateTime.Null : feedComment.DateAdded ),
				new SqlParameter("@DateModified", feedComment.DateModified == DateTime.MinValue ? SqlDateTime.Null : feedComment.DateModified )
			};

			feedComment.FeedCommentID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FeedCommentInsert", parameters));
			return Ok(new {FeedCommentID=feedComment.FeedCommentID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the FeedComment table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedCommentUpdate")]
		public  IActionResult FeedCommentUpdate([FromBody] FeedComment feedComment)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedCommentID", feedComment.FeedCommentID == 0 ? SqlInt32.Null : feedComment.FeedCommentID ),
				new SqlParameter("@FeedID", feedComment.FeedID == 0 ? SqlInt32.Null : feedComment.FeedID ),
				new SqlParameter("@UserID", feedComment.UserID == 0 ? SqlInt32.Null : feedComment.UserID ),
				new SqlParameter("@Comment", feedComment.Comment),
				new SqlParameter("@IsDeleted", feedComment.IsDeleted),
				new SqlParameter("@DateAdded", feedComment.DateAdded == DateTime.MinValue ? SqlDateTime.Null : feedComment.DateAdded ),
				new SqlParameter("@DateModified", feedComment.DateModified == DateTime.MinValue ? SqlDateTime.Null : feedComment.DateModified )
			};

			 var FeedCommentID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "FeedCommentUpdate", parameters));
			return Ok(new {FeedCommentID =FeedCommentID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the FeedComment table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedCommentDelete")]
		public  IActionResult FeedCommentDelete(int feedCommentID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedCommentID", feedCommentID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var feedCommentDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FeedCommentDelete", parameters));
			return Ok(new {FeedCommentID =feedCommentDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FeedComment table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedCommentSelect")]
		public IActionResult FeedCommentSelect(int feedCommentID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedCommentID", feedCommentID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FeedCommentSelect", parameters))
			{
				List<FeedComment> FeedCommentList = new List<FeedComment>();
				while (dataReader.Read())
				{
					FeedComment FeedComment = MakeFeedComment(dataReader);
					FeedCommentList.Add(FeedComment);
				}

				return  Ok(new {FeedCommentList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FeedComment table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedCommentSelectAll")]
		public IActionResult FeedCommentSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FeedCommentSelectAll", parameters))
			{
				List<FeedComment> FeedCommentList = new List<FeedComment>();
				while (dataReader.Read())
				{
					FeedComment FeedComment = MakeFeedComment(dataReader);
					FeedCommentList.Add(FeedComment);
				}

				return  Ok(new {FeedCommentList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the FeedComment table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedCommentSelectAllByFeedID")]
		public  IActionResult FeedCommentSelectAllByFeedID(int feedID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedID", feedID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FeedCommentSelectAllByFeedID", parameters))
			{
				List<FeedComment> FeedCommentList = new List<FeedComment>();
				while (dataReader.Read())
				{
					FeedComment FeedComment = MakeFeedComment(dataReader);
					FeedCommentList.Add(FeedComment);
				}

				return  Ok(new {FeedCommentList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the FeedComment table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedCommentSelectByQuery")]
		public  IActionResult FeedCommentSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FeedCommentSelectByQuery", parameters))
			{
				List<FeedComment> FeedCommentList = new List<FeedComment>();
				while (dataReader.Read())
				{
					FeedComment FeedComment = MakeFeedComment(dataReader);
					FeedCommentList.Add(FeedComment);
				}

				return  Ok(new {FeedCommentList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the FeedComment class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  FeedComment MakeFeedComment(SqlDataReader dataReader)
		{
			FeedComment feedComment = new FeedComment();
			feedComment.FeedCommentID = DataAccess.GetInt32(dataReader, "FeedCommentID", 0);
			feedComment.FeedID = DataAccess.GetInt32(dataReader, "FeedID", 0);
			feedComment.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			feedComment.Comment = DataAccess.GetString(dataReader, "Comment", String.Empty);
			feedComment.IsDeleted = DataAccess.GetBoolean(dataReader, "IsDeleted", false);
			feedComment.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			feedComment.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);

			return feedComment;
		}

	}
	}
