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
	public class FeedShareAPI : ControllerBase
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
		/// Saves a record to the FeedShare table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedShareInsert")]
		public  IActionResult FeedShareInsert([FromBody] FeedShare feedShare)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedID", feedShare.FeedID == 0 ? SqlInt32.Null : feedShare.FeedID ),
				new SqlParameter("@UserID", feedShare.UserID == 0 ? SqlInt32.Null : feedShare.UserID ),
				new SqlParameter("@ShareType", feedShare.ShareType),
				new SqlParameter("@SharedOn", feedShare.SharedOn == DateTime.MinValue ? SqlDateTime.Null : feedShare.SharedOn )
			};

			feedShare.FeedShareID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FeedShareInsert", parameters));
			return Ok(new {FeedShareID=feedShare.FeedShareID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the FeedShare table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedShareUpdate")]
		public  IActionResult FeedShareUpdate([FromBody] FeedShare feedShare)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedShareID", feedShare.FeedShareID == 0 ? SqlInt32.Null : feedShare.FeedShareID ),
				new SqlParameter("@FeedID", feedShare.FeedID == 0 ? SqlInt32.Null : feedShare.FeedID ),
				new SqlParameter("@UserID", feedShare.UserID == 0 ? SqlInt32.Null : feedShare.UserID ),
				new SqlParameter("@ShareType", feedShare.ShareType),
				new SqlParameter("@SharedOn", feedShare.SharedOn == DateTime.MinValue ? SqlDateTime.Null : feedShare.SharedOn )
			};

			 var FeedShareID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "FeedShareUpdate", parameters));
			return Ok(new {FeedShareID =FeedShareID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the FeedShare table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedShareDelete")]
		public  IActionResult FeedShareDelete(int feedShareID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedShareID", feedShareID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var feedShareDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FeedShareDelete", parameters));
			return Ok(new {FeedShareID =feedShareDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FeedShare table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedShareSelect")]
		public IActionResult FeedShareSelect(int feedShareID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedShareID", feedShareID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FeedShareSelect", parameters))
			{
				List<FeedShare> FeedShareList = new List<FeedShare>();
				while (dataReader.Read())
				{
					FeedShare FeedShare = MakeFeedShare(dataReader);
					FeedShareList.Add(FeedShare);
				}

				return  Ok(new {FeedShareList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FeedShare table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedShareSelectAll")]
		public IActionResult FeedShareSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FeedShareSelectAll", parameters))
			{
				List<FeedShare> FeedShareList = new List<FeedShare>();
				while (dataReader.Read())
				{
					FeedShare FeedShare = MakeFeedShare(dataReader);
					FeedShareList.Add(FeedShare);
				}

				return  Ok(new {FeedShareList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the FeedShare table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedShareSelectAllByFeedID")]
		public  IActionResult FeedShareSelectAllByFeedID(int feedID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedID", feedID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FeedShareSelectAllByFeedID", parameters))
			{
				List<FeedShare> FeedShareList = new List<FeedShare>();
				while (dataReader.Read())
				{
					FeedShare FeedShare = MakeFeedShare(dataReader);
					FeedShareList.Add(FeedShare);
				}

				return  Ok(new {FeedShareList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the FeedShare table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedShareSelectByQuery")]
		public  IActionResult FeedShareSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FeedShareSelectByQuery", parameters))
			{
				List<FeedShare> FeedShareList = new List<FeedShare>();
				while (dataReader.Read())
				{
					FeedShare FeedShare = MakeFeedShare(dataReader);
					FeedShareList.Add(FeedShare);
				}

				return  Ok(new {FeedShareList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the FeedShare class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  FeedShare MakeFeedShare(SqlDataReader dataReader)
		{
			FeedShare feedShare = new FeedShare();
			feedShare.FeedShareID = DataAccess.GetInt32(dataReader, "FeedShareID", 0);
			feedShare.FeedID = DataAccess.GetInt32(dataReader, "FeedID", 0);
			feedShare.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			feedShare.ShareType = DataAccess.GetString(dataReader, "ShareType", String.Empty);
			feedShare.SharedOn = DataAccess.GetDateTime(dataReader, "SharedOn", DateTime.MinValue);

			return feedShare;
		}

	}
	}
