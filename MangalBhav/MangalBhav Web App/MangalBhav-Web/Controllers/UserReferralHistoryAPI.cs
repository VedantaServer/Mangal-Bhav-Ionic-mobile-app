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
	public class UserReferralHistoryAPI : ControllerBase
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
		/// Saves a record to the UserReferralHistory table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("UserReferralHistoryInsert")]
		public  IActionResult UserReferralHistoryInsert([FromBody] UserReferralHistory userReferralHistory)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ReferrerUserID", userReferralHistory.ReferrerUserID == 0 ? SqlInt32.Null : userReferralHistory.ReferrerUserID ),
				new SqlParameter("@ReferredUserID", userReferralHistory.ReferredUserID == 0 ? SqlInt32.Null : userReferralHistory.ReferredUserID ),
				new SqlParameter("@ReferralCode", userReferralHistory.ReferralCode),
				new SqlParameter("@ReferralDate", userReferralHistory.ReferralDate == DateTime.MinValue ? SqlDateTime.Null : userReferralHistory.ReferralDate )
			};

			userReferralHistory.UserReferralHistoryID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "UserReferralHistoryInsert", parameters));
			return Ok(new {UserReferralHistoryID=userReferralHistory.UserReferralHistoryID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the UserReferralHistory table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("UserReferralHistoryUpdate")]
		public  IActionResult UserReferralHistoryUpdate([FromBody] UserReferralHistory userReferralHistory)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserReferralHistoryID", userReferralHistory.UserReferralHistoryID == 0 ? SqlInt32.Null : userReferralHistory.UserReferralHistoryID ),
				new SqlParameter("@ReferrerUserID", userReferralHistory.ReferrerUserID == 0 ? SqlInt32.Null : userReferralHistory.ReferrerUserID ),
				new SqlParameter("@ReferredUserID", userReferralHistory.ReferredUserID == 0 ? SqlInt32.Null : userReferralHistory.ReferredUserID ),
				new SqlParameter("@ReferralCode", userReferralHistory.ReferralCode),
				new SqlParameter("@ReferralDate", userReferralHistory.ReferralDate == DateTime.MinValue ? SqlDateTime.Null : userReferralHistory.ReferralDate )
			};

			 var UserReferralHistoryID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "UserReferralHistoryUpdate", parameters));
			return Ok(new {UserReferralHistoryID =UserReferralHistoryID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the UserReferralHistory table by its primary key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("UserReferralHistoryDelete")]
		public  IActionResult UserReferralHistoryDelete(int userReferralHistoryID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserReferralHistoryID", userReferralHistoryID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var userReferralHistoryDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "UserReferralHistoryDelete", parameters));
			return Ok(new {UserReferralHistoryID =userReferralHistoryDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the UserReferralHistory table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("UserReferralHistorySelect")]
		public IActionResult UserReferralHistorySelect(int userReferralHistoryID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserReferralHistoryID", userReferralHistoryID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "UserReferralHistorySelect", parameters))
			{
				List<UserReferralHistory> UserReferralHistoryList = new List<UserReferralHistory>();
				while (dataReader.Read())
				{
					UserReferralHistory UserReferralHistory = MakeUserReferralHistory(dataReader);
					UserReferralHistoryList.Add(UserReferralHistory);
				}

				return  Ok(new {UserReferralHistoryList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the UserReferralHistory table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("UserReferralHistorySelectAll")]
		public IActionResult UserReferralHistorySelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "UserReferralHistorySelectAll", parameters))
			{
				List<UserReferralHistory> UserReferralHistoryList = new List<UserReferralHistory>();
				while (dataReader.Read())
				{
					UserReferralHistory UserReferralHistory = MakeUserReferralHistory(dataReader);
					UserReferralHistoryList.Add(UserReferralHistory);
				}

				return  Ok(new {UserReferralHistoryList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the UserReferralHistory table by a ak=ll query.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("UserReferralHistorySelectByQuery")]
		public  IActionResult UserReferralHistorySelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "UserReferralHistorySelectByQuery", parameters))
			{
				List<UserReferralHistory> UserReferralHistoryList = new List<UserReferralHistory>();
				while (dataReader.Read())
				{
					UserReferralHistory UserReferralHistory = MakeUserReferralHistory(dataReader);
					UserReferralHistoryList.Add(UserReferralHistory);
				}

				return  Ok(new {UserReferralHistoryList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the UserReferralHistory class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  UserReferralHistory MakeUserReferralHistory(SqlDataReader dataReader)
		{
			UserReferralHistory userReferralHistory = new UserReferralHistory();
			userReferralHistory.UserReferralHistoryID = DataAccess.GetInt32(dataReader, "UserReferralHistoryID", 0);
			userReferralHistory.ReferrerUserID = DataAccess.GetInt32(dataReader, "ReferrerUserID", 0);
			userReferralHistory.ReferredUserID = DataAccess.GetInt32(dataReader, "ReferredUserID", 0);
			userReferralHistory.ReferralCode = DataAccess.GetString(dataReader, "ReferralCode", String.Empty);
			userReferralHistory.ReferralDate = DataAccess.GetDateTime(dataReader, "ReferralDate", DateTime.MinValue);

			return userReferralHistory;
		}

	}
	}
