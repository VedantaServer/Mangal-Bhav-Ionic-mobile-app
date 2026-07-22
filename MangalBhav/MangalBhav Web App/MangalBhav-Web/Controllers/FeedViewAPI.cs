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
	public class FeedViewAPI : ControllerBase
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
		/// Saves a record to the FeedView table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedViewInsert")]
		public  IActionResult FeedViewInsert([FromBody] FeedView feedView)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedID", feedView.FeedID == 0 ? SqlInt32.Null : feedView.FeedID ),
				new SqlParameter("@UserID", feedView.UserID == 0 ? SqlInt32.Null : feedView.UserID ),
				new SqlParameter("@ViewedOn", feedView.ViewedOn == DateTime.MinValue ? SqlDateTime.Null : feedView.ViewedOn )
			};

			feedView.FeedViewID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FeedViewInsert", parameters));
			return Ok(new {FeedViewID=feedView.FeedViewID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the FeedView table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedViewUpdate")]
		public  IActionResult FeedViewUpdate([FromBody] FeedView feedView)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedViewID", feedView.FeedViewID == 0 ? SqlInt32.Null : feedView.FeedViewID ),
				new SqlParameter("@FeedID", feedView.FeedID == 0 ? SqlInt32.Null : feedView.FeedID ),
				new SqlParameter("@UserID", feedView.UserID == 0 ? SqlInt32.Null : feedView.UserID ),
				new SqlParameter("@ViewedOn", feedView.ViewedOn == DateTime.MinValue ? SqlDateTime.Null : feedView.ViewedOn )
			};

			 var FeedViewID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "FeedViewUpdate", parameters));
			return Ok(new {FeedViewID =FeedViewID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the FeedView table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedViewDelete")]
		public  IActionResult FeedViewDelete(int feedViewID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedViewID", feedViewID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var feedViewDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FeedViewDelete", parameters));
			return Ok(new {FeedViewID =feedViewDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FeedView table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedViewSelect")]
		public IActionResult FeedViewSelect(int feedViewID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedViewID", feedViewID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FeedViewSelect", parameters))
			{
				List<FeedView> FeedViewList = new List<FeedView>();
				while (dataReader.Read())
				{
					FeedView FeedView = MakeFeedView(dataReader);
					FeedViewList.Add(FeedView);
				}

				return  Ok(new {FeedViewList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FeedView table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedViewSelectAll")]
		public IActionResult FeedViewSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FeedViewSelectAll", parameters))
			{
				List<FeedView> FeedViewList = new List<FeedView>();
				while (dataReader.Read())
				{
					FeedView FeedView = MakeFeedView(dataReader);
					FeedViewList.Add(FeedView);
				}

				return  Ok(new {FeedViewList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the FeedView table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedViewSelectAllByFeedID")]
		public  IActionResult FeedViewSelectAllByFeedID(int feedID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FeedID", feedID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FeedViewSelectAllByFeedID", parameters))
			{
				List<FeedView> FeedViewList = new List<FeedView>();
				while (dataReader.Read())
				{
					FeedView FeedView = MakeFeedView(dataReader);
					FeedViewList.Add(FeedView);
				}

				return  Ok(new {FeedViewList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the FeedView table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FeedViewSelectByQuery")]
		public  IActionResult FeedViewSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FeedViewSelectByQuery", parameters))
			{
				List<FeedView> FeedViewList = new List<FeedView>();
				while (dataReader.Read())
				{
					FeedView FeedView = MakeFeedView(dataReader);
					FeedViewList.Add(FeedView);
				}

				return  Ok(new {FeedViewList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the FeedView class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  FeedView MakeFeedView(SqlDataReader dataReader)
		{
			FeedView feedView = new FeedView();
			feedView.FeedViewID = DataAccess.GetInt32(dataReader, "FeedViewID", 0);
			feedView.FeedID = DataAccess.GetInt32(dataReader, "FeedID", 0);
			feedView.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			feedView.ViewedOn = DataAccess.GetDateTime(dataReader, "ViewedOn", DateTime.MinValue);

			return feedView;
		}

	}
	}
