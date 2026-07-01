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
	public class UserReferralCodeAPI : ControllerBase
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
		/// Saves a record to the UserReferralCode table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("UserReferralCodeInsert")]
		public  IActionResult UserReferralCodeInsert([FromBody] UserReferralCode userReferralCode)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", userReferralCode.TenantID == 0 ? SqlInt32.Null : userReferralCode.TenantID ),
				new SqlParameter("@UserID", userReferralCode.UserID == 0 ? SqlInt32.Null : userReferralCode.UserID ),
				new SqlParameter("@ReferralCode", userReferralCode.ReferralCode),
				new SqlParameter("@IsActive", userReferralCode.IsActive),
				new SqlParameter("@CreatedDate", userReferralCode.CreatedDate == DateTime.MinValue ? SqlDateTime.Null : userReferralCode.CreatedDate ),
				new SqlParameter("@ModifiedDate", userReferralCode.ModifiedDate == DateTime.MinValue ? SqlDateTime.Null : userReferralCode.ModifiedDate )
			};

			userReferralCode.UserReferralCodeID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "UserReferralCodeInsert", parameters));
			return Ok(new {UserReferralCodeID=userReferralCode.UserReferralCodeID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the UserReferralCode table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("UserReferralCodeUpdate")]
		public  IActionResult UserReferralCodeUpdate([FromBody] UserReferralCode userReferralCode)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserReferralCodeID", userReferralCode.UserReferralCodeID == 0 ? SqlInt32.Null : userReferralCode.UserReferralCodeID ),
				new SqlParameter("@TenantID", userReferralCode.TenantID == 0 ? SqlInt32.Null : userReferralCode.TenantID ),
				new SqlParameter("@UserID", userReferralCode.UserID == 0 ? SqlInt32.Null : userReferralCode.UserID ),
				new SqlParameter("@ReferralCode", userReferralCode.ReferralCode),
				new SqlParameter("@IsActive", userReferralCode.IsActive),
				new SqlParameter("@CreatedDate", userReferralCode.CreatedDate == DateTime.MinValue ? SqlDateTime.Null : userReferralCode.CreatedDate ),
				new SqlParameter("@ModifiedDate", userReferralCode.ModifiedDate == DateTime.MinValue ? SqlDateTime.Null : userReferralCode.ModifiedDate )
			};

			 var UserReferralCodeID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "UserReferralCodeUpdate", parameters));
			return Ok(new {UserReferralCodeID =UserReferralCodeID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the UserReferralCode table by its primary key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("UserReferralCodeDelete")]
		public  IActionResult UserReferralCodeDelete(int userReferralCodeID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserReferralCodeID", userReferralCodeID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var userReferralCodeDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "UserReferralCodeDelete", parameters));
			return Ok(new {UserReferralCodeID =userReferralCodeDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the UserReferralCode table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("UserReferralCodeSelect")]
		public IActionResult UserReferralCodeSelect(int userReferralCodeID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserReferralCodeID", userReferralCodeID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "UserReferralCodeSelect", parameters))
			{
				List<UserReferralCode> UserReferralCodeList = new List<UserReferralCode>();
				while (dataReader.Read())
				{
					UserReferralCode UserReferralCode = MakeUserReferralCode(dataReader);
					UserReferralCodeList.Add(UserReferralCode);
				}

				return  Ok(new {UserReferralCodeList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the UserReferralCode table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("UserReferralCodeSelectAll")]
		public IActionResult UserReferralCodeSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "UserReferralCodeSelectAll", parameters))
			{
				List<UserReferralCode> UserReferralCodeList = new List<UserReferralCode>();
				while (dataReader.Read())
				{
					UserReferralCode UserReferralCode = MakeUserReferralCode(dataReader);
					UserReferralCodeList.Add(UserReferralCode);
				}

				return  Ok(new {UserReferralCodeList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the UserReferralCode table by a ak=ll query.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("UserReferralCodeSelectByQuery")]
		public  IActionResult UserReferralCodeSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "UserReferralCodeSelectByQuery", parameters))
			{
				List<UserReferralCode> UserReferralCodeList = new List<UserReferralCode>();
				while (dataReader.Read())
				{
					UserReferralCode UserReferralCode = MakeUserReferralCode(dataReader);
					UserReferralCodeList.Add(UserReferralCode);
				}

				return  Ok(new {UserReferralCodeList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the UserReferralCode class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  UserReferralCode MakeUserReferralCode(SqlDataReader dataReader)
		{
			UserReferralCode userReferralCode = new UserReferralCode();
			userReferralCode.UserReferralCodeID = DataAccess.GetInt32(dataReader, "UserReferralCodeID", 0);
			userReferralCode.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			userReferralCode.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			userReferralCode.ReferralCode = DataAccess.GetString(dataReader, "ReferralCode", String.Empty);
			userReferralCode.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			userReferralCode.CreatedDate = DataAccess.GetDateTime(dataReader, "CreatedDate", DateTime.MinValue);
			userReferralCode.ModifiedDate = DataAccess.GetDateTime(dataReader, "ModifiedDate", DateTime.MinValue);

			return userReferralCode;
		}

	}
	}
