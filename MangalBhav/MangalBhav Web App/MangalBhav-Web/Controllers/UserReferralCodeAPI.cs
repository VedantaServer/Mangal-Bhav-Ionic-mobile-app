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
		/// Saves a record to the UserReferralCodes table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UserReferralCodesInsert")]
		public  IActionResult UserReferralCodesInsert([FromBody] UserReferralCode userReferralCode)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", userReferralCode.TenantID == 0 ? SqlInt32.Null : userReferralCode.TenantID ),
				new SqlParameter("@UserID", userReferralCode.UserID == 0 ? SqlInt32.Null : userReferralCode.UserID ),
				new SqlParameter("@ReferralCode", userReferralCode.ReferralCode),
				new SqlParameter("@DateAdded", userReferralCode.DateAdded == DateTime.MinValue ? SqlDateTime.Null : userReferralCode.DateAdded )
			};

			userReferralCode.UserReferralCodeID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "UserReferralCodesInsert", parameters));
			return Ok(new {UserReferralCodeID=userReferralCode.UserReferralCodeID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the UserReferralCodes table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UserReferralCodesUpdate")]
		public  IActionResult UserReferralCodesUpdate([FromBody] UserReferralCode userReferralCode)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", userReferralCode.TenantID == 0 ? SqlInt32.Null : userReferralCode.TenantID ),
				new SqlParameter("@UserReferralCodeID", userReferralCode.UserReferralCodeID == 0 ? SqlInt32.Null : userReferralCode.UserReferralCodeID ),
				new SqlParameter("@UserID", userReferralCode.UserID == 0 ? SqlInt32.Null : userReferralCode.UserID ),
				new SqlParameter("@ReferralCode", userReferralCode.ReferralCode),
				new SqlParameter("@DateAdded", userReferralCode.DateAdded == DateTime.MinValue ? SqlDateTime.Null : userReferralCode.DateAdded )
			};

			 var UserReferralCodeID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "UserReferralCodesUpdate", parameters));
			return Ok(new {UserReferralCodeID =UserReferralCodeID});
			}, this);
		}

	
		/// <summary>
		/// Selects a single record from the UserReferralCodes table.
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
				new SqlParameter("@TenantID", tenantID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "UserReferralCodesSelect", parameters))
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
		/// Selects a single record from the UserReferralCodes table.
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
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "UserReferralCodesSelectAll", parameters))
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
		/// Selects all query records from the UserReferralCodes table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UserReferralCodesSelectByQuery")]
		public  IActionResult UserReferralCodesSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "UserReferralCodesSelectByQuery", parameters))
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
		/// Creates a new instance of the UserReferralCodes class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  UserReferralCode MakeUserReferralCode(SqlDataReader dataReader)
		{
			UserReferralCode userReferralCode = new UserReferralCode();
			userReferralCode.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			userReferralCode.UserReferralCodeID = DataAccess.GetInt32(dataReader, "UserReferralCodeID", 0);
			userReferralCode.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			userReferralCode.ReferralCode = DataAccess.GetString(dataReader, "ReferralCode", String.Empty);
			userReferralCode.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);

			return userReferralCode;
		}

	}
	}
