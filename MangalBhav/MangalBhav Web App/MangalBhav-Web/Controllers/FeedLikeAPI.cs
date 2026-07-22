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
	public class FeedLikeAPI : ControllerBase
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
		/// Saves a record to the FeedLike table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedLikeInsert")]
		public  IActionResult FeedLikeInsert([FromBody] FeedLike feedLike)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedID", feedLike.FeedID == 0 ? SqlInt32.Null : feedLike.FeedID ),
				new SqlParameter("@UserID", feedLike.UserID == 0 ? SqlInt32.Null : feedLike.UserID ),
				new SqlParameter("@DateAdded", feedLike.DateAdded == DateTime.MinValue ? SqlDateTime.Null : feedLike.DateAdded )
			};

			feedLike.FeedLikeID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FeedLikeInsert", parameters));
			return Ok(new {FeedLikeID=feedLike.FeedLikeID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the FeedLike table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedLikeUpdate")]
		public  IActionResult FeedLikeUpdate([FromBody] FeedLike feedLike)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedLikeID", feedLike.FeedLikeID == 0 ? SqlInt32.Null : feedLike.FeedLikeID ),
				new SqlParameter("@FeedID", feedLike.FeedID == 0 ? SqlInt32.Null : feedLike.FeedID ),
				new SqlParameter("@UserID", feedLike.UserID == 0 ? SqlInt32.Null : feedLike.UserID ),
				new SqlParameter("@DateAdded", feedLike.DateAdded == DateTime.MinValue ? SqlDateTime.Null : feedLike.DateAdded )
			};

			 var FeedLikeID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "FeedLikeUpdate", parameters));
			return Ok(new {FeedLikeID =FeedLikeID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the FeedLike table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedLikeDelete")]
		public  IActionResult FeedLikeDelete(int feedLikeID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedLikeID", feedLikeID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var feedLikeDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FeedLikeDelete", parameters));
			return Ok(new {FeedLikeID =feedLikeDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FeedLike table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedLikeSelect")]
		public IActionResult FeedLikeSelect(int feedLikeID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedLikeID", feedLikeID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FeedLikeSelect", parameters))
			{
				List<FeedLike> FeedLikeList = new List<FeedLike>();
				while (dataReader.Read())
				{
					FeedLike FeedLike = MakeFeedLike(dataReader);
					FeedLikeList.Add(FeedLike);
				}

				return  Ok(new {FeedLikeList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FeedLike table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedLikeSelectAll")]
		public IActionResult FeedLikeSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FeedLikeSelectAll", parameters))
			{
				List<FeedLike> FeedLikeList = new List<FeedLike>();
				while (dataReader.Read())
				{
					FeedLike FeedLike = MakeFeedLike(dataReader);
					FeedLikeList.Add(FeedLike);
				}

				return  Ok(new {FeedLikeList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the FeedLike table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedLikeSelectAllByFeedID")]
		public  IActionResult FeedLikeSelectAllByFeedID(int feedID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedID", feedID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FeedLikeSelectAllByFeedID", parameters))
			{
				List<FeedLike> FeedLikeList = new List<FeedLike>();
				while (dataReader.Read())
				{
					FeedLike FeedLike = MakeFeedLike(dataReader);
					FeedLikeList.Add(FeedLike);
				}

				return  Ok(new {FeedLikeList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the FeedLike table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedLikeSelectByQuery")]
		public  IActionResult FeedLikeSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FeedLikeSelectByQuery", parameters))
			{
				List<FeedLike> FeedLikeList = new List<FeedLike>();
				while (dataReader.Read())
				{
					FeedLike FeedLike = MakeFeedLike(dataReader);
					FeedLikeList.Add(FeedLike);
				}

				return  Ok(new {FeedLikeList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the FeedLike class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  FeedLike MakeFeedLike(SqlDataReader dataReader)
		{
			FeedLike feedLike = new FeedLike();
			feedLike.FeedLikeID = DataAccess.GetInt32(dataReader, "FeedLikeID", 0);
			feedLike.FeedID = DataAccess.GetInt32(dataReader, "FeedID", 0);
			feedLike.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			feedLike.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);

			return feedLike;
		}

	}
	}
