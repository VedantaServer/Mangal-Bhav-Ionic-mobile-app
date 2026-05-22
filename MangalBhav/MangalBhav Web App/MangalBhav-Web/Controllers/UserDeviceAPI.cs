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
	public class UserDeviceAPI : ControllerBase
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
		/// Saves a record to the UserDevice table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UserDeviceInsert")]
		public  IActionResult UserDeviceInsert([FromBody] UserDevice userDevice)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@DeviceID", userDevice.DeviceID),
				new SqlParameter("@UserID", userDevice.UserID == 0 ? SqlInt32.Null : userDevice.UserID ),
				new SqlParameter("@FCMToken", userDevice.FCMToken),
				new SqlParameter("@Platform", userDevice.Platform),
				new SqlParameter("@IsActive", userDevice.IsActive),
				new SqlParameter("@DateAdded", userDevice.DateAdded == DateTime.MinValue ? SqlDateTime.Null : userDevice.DateAdded ),
				new SqlParameter("@DateModified", userDevice.DateModified == DateTime.MinValue ? SqlDateTime.Null : userDevice.DateModified )
			};

			userDevice.UserDeviceID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "UserDeviceInsert", parameters));
			return Ok(new {UserDeviceID=userDevice.UserDeviceID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the UserDevice table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UserDeviceUpdate")]
		public  IActionResult UserDeviceUpdate([FromBody] UserDevice userDevice)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserDeviceID", userDevice.UserDeviceID == 0 ? SqlInt32.Null : userDevice.UserDeviceID ),
				new SqlParameter("@DeviceID", userDevice.DeviceID),
				new SqlParameter("@UserID", userDevice.UserID == 0 ? SqlInt32.Null : userDevice.UserID ),
				new SqlParameter("@FCMToken", userDevice.FCMToken),
				new SqlParameter("@Platform", userDevice.Platform),
				new SqlParameter("@IsActive", userDevice.IsActive),
				new SqlParameter("@DateAdded", userDevice.DateAdded == DateTime.MinValue ? SqlDateTime.Null : userDevice.DateAdded ),
				new SqlParameter("@DateModified", userDevice.DateModified == DateTime.MinValue ? SqlDateTime.Null : userDevice.DateModified )
			};

			 var UserDeviceID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "UserDeviceUpdate", parameters));
			return Ok(new {UserDeviceID =UserDeviceID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the UserDevice table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UserDeviceDelete")]
		public  IActionResult UserDeviceDelete(int userDeviceID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserDeviceID", userDeviceID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var userDeviceDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "UserDeviceDelete", parameters));
			return Ok(new {UserDeviceID =userDeviceDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the UserDevice table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UserDeviceSelect")]
		public IActionResult UserDeviceSelect(int userDeviceID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserDeviceID", userDeviceID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "UserDeviceSelect", parameters))
			{
				List<UserDevice> UserDeviceList = new List<UserDevice>();
				while (dataReader.Read())
				{
					UserDevice UserDevice = MakeUserDevice(dataReader);
					UserDeviceList.Add(UserDevice);
				}

				return  Ok(new {UserDeviceList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the UserDevice table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UserDeviceSelectAll")]
		public IActionResult UserDeviceSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "UserDeviceSelectAll", parameters))
			{
				List<UserDevice> UserDeviceList = new List<UserDevice>();
				while (dataReader.Read())
				{
					UserDevice UserDevice = MakeUserDevice(dataReader);
					UserDeviceList.Add(UserDevice);
				}

				return  Ok(new {UserDeviceList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the UserDevice table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UserDeviceSelectByQuery")]
		public  IActionResult UserDeviceSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "UserDeviceSelectByQuery", parameters))
			{
				List<UserDevice> UserDeviceList = new List<UserDevice>();
				while (dataReader.Read())
				{
					UserDevice UserDevice = MakeUserDevice(dataReader);
					UserDeviceList.Add(UserDevice);
				}

				return  Ok(new {UserDeviceList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the UserDevice class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  UserDevice MakeUserDevice(SqlDataReader dataReader)
		{
			UserDevice userDevice = new UserDevice();
			userDevice.UserDeviceID = DataAccess.GetInt32(dataReader, "UserDeviceID", 0);
			userDevice.DeviceID = DataAccess.GetString(dataReader, "DeviceID", String.Empty);
			userDevice.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			userDevice.FCMToken = DataAccess.GetString(dataReader, "FCMToken", String.Empty);
			userDevice.Platform = DataAccess.GetString(dataReader, "Platform", String.Empty);
			userDevice.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			userDevice.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			userDevice.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);

			return userDevice;
		}

	}
	}
