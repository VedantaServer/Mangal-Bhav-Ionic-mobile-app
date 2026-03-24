using System;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Data.SqlTypes;
using System.Collections.Generic;
using Microsoft.AspNetCore.Cors;
using FaceUPAI.Models;
using FaceUPAI.DataAccessService;
using FaceUPAI.Controllers.Common;

namespace FaceUPAI.API
{
	public class UserAPI : ControllerBase
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
		/// Saves a record to the Users table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UsersInsert")]
		public  IActionResult UsersInsert([FromBody] User user)
		{
			return ApiHandler.Handle(() =>
			{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", user.TenantID == 0 ? SqlInt32.Null : user.TenantID ),
				new SqlParameter("@Role", user.Role),
				new SqlParameter("@LoginID", user.LoginID),
				new SqlParameter("@PasswordHash", user.PasswordHash),
				new SqlParameter("@IsLocked", user.IsLocked),
				new SqlParameter("@Status", user.Status),
				new SqlParameter("@LastLoginAt", user.LastLoginAt == DateTime.MinValue ? SqlDateTime.Null : user.LastLoginAt ),
				new SqlParameter("@PasswordChangedAt", user.PasswordChangedAt == DateTime.MinValue ? SqlDateTime.Null : user.PasswordChangedAt ),
				new SqlParameter("@DateAdded", user.DateAdded == DateTime.MinValue ? SqlDateTime.Null : user.DateAdded ),
				new SqlParameter("@DateModified", user.DateModified == DateTime.MinValue ? SqlDateTime.Null : user.DateModified ),
				new SqlParameter("@UpdatedByUser", user.UpdatedByUser)
			};

			user.UserID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "UsersInsert", parameters));
			return Ok(new {UserID=user.UserID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the Users table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UsersUpdate")]
		public  IActionResult UsersUpdate([FromBody] User user)
		{
			return ApiHandler.Handle(() =>
			{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserID", user.UserID == 0 ? SqlInt32.Null : user.UserID ),
				new SqlParameter("@TenantID", user.TenantID == 0 ? SqlInt32.Null : user.TenantID ),
				new SqlParameter("@Role", user.Role),
				new SqlParameter("@LoginID", user.LoginID),
				new SqlParameter("@PasswordHash", user.PasswordHash),
				new SqlParameter("@IsLocked", user.IsLocked),
				new SqlParameter("@Status", user.Status),
				new SqlParameter("@LastLoginAt", user.LastLoginAt == DateTime.MinValue ? SqlDateTime.Null : user.LastLoginAt ),
				new SqlParameter("@PasswordChangedAt", user.PasswordChangedAt == DateTime.MinValue ? SqlDateTime.Null : user.PasswordChangedAt ),
				new SqlParameter("@DateAdded", user.DateAdded == DateTime.MinValue ? SqlDateTime.Null : user.DateAdded ),
				new SqlParameter("@DateModified", user.DateModified == DateTime.MinValue ? SqlDateTime.Null : user.DateModified ),
				new SqlParameter("@UpdatedByUser", user.UpdatedByUser)
			};

			 var UserID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "UsersUpdate", parameters));
			return Ok(new {UserID =UserID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the Users table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UsersDelete")]
		public  IActionResult UsersDelete(int userID, int tenantID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserID", userID)
				,new SqlParameter("@TenantID", tenantID)
			};

			 var usersDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "UsersDelete", parameters));
			return Ok(new {UsersID =usersDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Users table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UserSelect")]
		public IActionResult UserSelect(int userID,int tenantID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserID", userID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "UsersSelect", parameters))
			{
				List<User> UserList = new List<User>();
				while (dataReader.Read())
				{
					User User = MakeUser(dataReader);
					UserList.Add(User);
				}

				return  Ok(new {UserList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Users table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UserSelectAll")]
		public IActionResult UserSelectAll(int tenantID ){
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "UsersSelectAll", parameters))
			{
				List<User> UserList = new List<User>();
				while (dataReader.Read())
				{
					User User = MakeUser(dataReader);
					UserList.Add(User);
				}

				return  Ok(new {UserList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the Users table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UsersSelectAllByTenantID")]
		public  IActionResult UsersSelectAllByTenantID(int tenantID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "UsersSelectAllByTenantID", parameters))
			{
				List<User> UserList = new List<User>();
				while (dataReader.Read())
				{
					User User = MakeUser(dataReader);
					UserList.Add(User);
				}

				return  Ok(new {UserList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the Users table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("UsersNUSelectByQuery")]
		public  IActionResult UsersNUSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
										new SqlParameter("@Query", Query)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "UsersNUSelectByQuery", parameters))
			{
				List<User> UserList = new List<User>();
				while (dataReader.Read())
				{
					User User = MakeUser(dataReader);
					UserList.Add(User);
				}

				return  Ok(new {UserList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the Users class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  User MakeUser(SqlDataReader dataReader)
		{
			User user = new User();
			user.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			user.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			user.Role = DataAccess.GetString(dataReader, "Role", String.Empty);
			user.LoginID = DataAccess.GetString(dataReader, "LoginID", String.Empty);
			user.PasswordHash = DataAccess.GetString(dataReader, "PasswordHash", String.Empty);
			user.IsLocked = DataAccess.GetBoolean(dataReader, "IsLocked", false);
			user.Status = DataAccess.GetString(dataReader, "Status", String.Empty);
			user.LastLoginAt = DataAccess.GetDateTime(dataReader, "LastLoginAt", DateTime.MinValue);
			user.PasswordChangedAt = DataAccess.GetDateTime(dataReader, "PasswordChangedAt", DateTime.MinValue);
			user.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			user.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			user.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return user;
		}

	}
	}
