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
	public class MandirMemberAPI : ControllerBase
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
		/// Saves a record to the MandirMember table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirMemberInsert")]
		public  IActionResult MandirMemberInsert([FromBody] MandirMember mandirMember)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirMemberID", mandirMember.MandirMemberID == 0 ? SqlInt32.Null : mandirMember.MandirMemberID ),
				new SqlParameter("@TenantID", mandirMember.TenantID == 0 ? SqlInt32.Null : mandirMember.TenantID ),
				new SqlParameter("@MandirID", mandirMember.MandirID == 0 ? SqlInt32.Null : mandirMember.MandirID ),
				new SqlParameter("@UserID", mandirMember.UserID == 0 ? SqlInt32.Null : mandirMember.UserID ),
				new SqlParameter("@MemberRole", mandirMember.MemberRole),
				new SqlParameter("@IsActive", mandirMember.IsActive),
				new SqlParameter("@DateAdded", mandirMember.DateAdded == DateTime.MinValue ? SqlDateTime.Null : mandirMember.DateAdded ),
				new SqlParameter("@DateModified", mandirMember.DateModified == DateTime.MinValue ? SqlDateTime.Null : mandirMember.DateModified ),
				new SqlParameter("@UpdatedByUser", mandirMember.UpdatedByUser)
			};

			return Ok(DataAccess.ExecuteNonQuery(System.Data.CommandType.StoredProcedure, "MandirMemberInsert", parameters));
			}, this);
		}

		/// <summary>
		/// Updates a record in the MandirMember table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirMemberUpdate")]
		public  IActionResult MandirMemberUpdate([FromBody] MandirMember mandirMember)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirMemberID", mandirMember.MandirMemberID == 0 ? SqlInt32.Null : mandirMember.MandirMemberID ),
				new SqlParameter("@TenantID", mandirMember.TenantID == 0 ? SqlInt32.Null : mandirMember.TenantID ),
				new SqlParameter("@MandirID", mandirMember.MandirID == 0 ? SqlInt32.Null : mandirMember.MandirID ),
				new SqlParameter("@UserID", mandirMember.UserID == 0 ? SqlInt32.Null : mandirMember.UserID ),
				new SqlParameter("@MemberRole", mandirMember.MemberRole),
				new SqlParameter("@IsActive", mandirMember.IsActive),
				new SqlParameter("@DateAdded", mandirMember.DateAdded == DateTime.MinValue ? SqlDateTime.Null : mandirMember.DateAdded ),
				new SqlParameter("@DateModified", mandirMember.DateModified == DateTime.MinValue ? SqlDateTime.Null : mandirMember.DateModified ),
				new SqlParameter("@UpdatedByUser", mandirMember.UpdatedByUser)
			};

			 var MandirMemberID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "MandirMemberUpdate", parameters));
			return Ok(new {MandirMemberID =MandirMemberID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the MandirMember table by its primary key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirMemberDelete")]
		public  IActionResult MandirMemberDelete(int mandirMemberID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirMemberID", mandirMemberID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var mandirMemberDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MandirMemberDelete", parameters));
			return Ok(new {MandirMemberID =mandirMemberDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the MandirMember table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirMemberSelect")]
		public IActionResult MandirMemberSelect(int mandirMemberID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirMemberID", mandirMemberID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MandirMemberSelect", parameters))
			{
				List<MandirMember> MandirMemberList = new List<MandirMember>();
				while (dataReader.Read())
				{
					MandirMember MandirMember = MakeMandirMember(dataReader);
					MandirMemberList.Add(MandirMember);
				}

				return  Ok(new {MandirMemberList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the MandirMember table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirMemberSelectAll")]
		public IActionResult MandirMemberSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MandirMemberSelectAll", parameters))
			{
				List<MandirMember> MandirMemberList = new List<MandirMember>();
				while (dataReader.Read())
				{
					MandirMember MandirMember = MakeMandirMember(dataReader);
					MandirMemberList.Add(MandirMember);
				}

				return  Ok(new {MandirMemberList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the MandirMember table by a foreign key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirMemberSelectAllByMandirID")]
		public  IActionResult MandirMemberSelectAllByMandirID(int mandirID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirID", mandirID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MandirMemberSelectAllByMandirID", parameters))
			{
				List<MandirMember> MandirMemberList = new List<MandirMember>();
				while (dataReader.Read())
				{
					MandirMember MandirMember = MakeMandirMember(dataReader);
					MandirMemberList.Add(MandirMember);
				}

				return  Ok(new {MandirMemberList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the MandirMember table by a foreign key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirMemberSelectAllByTenantID")]
		public  IActionResult MandirMemberSelectAllByTenantID(int tenantID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MandirMemberSelectAllByTenantID", parameters))
			{
				List<MandirMember> MandirMemberList = new List<MandirMember>();
				while (dataReader.Read())
				{
					MandirMember MandirMember = MakeMandirMember(dataReader);
					MandirMemberList.Add(MandirMember);
				}

				return  Ok(new {MandirMemberList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the MandirMember table by a foreign key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirMemberSelectAllByUserID")]
		public  IActionResult MandirMemberSelectAllByUserID(int userID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@UserID", userID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MandirMemberSelectAllByUserID", parameters))
			{
				List<MandirMember> MandirMemberList = new List<MandirMember>();
				while (dataReader.Read())
				{
					MandirMember MandirMember = MakeMandirMember(dataReader);
					MandirMemberList.Add(MandirMember);
				}

				return  Ok(new {MandirMemberList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the MandirMember table by a ak=ll query.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("MandirMemberSelectByQuery")]
		public  IActionResult MandirMemberSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MandirMemberSelectByQuery", parameters))
			{
				List<MandirMember> MandirMemberList = new List<MandirMember>();
				while (dataReader.Read())
				{
					MandirMember MandirMember = MakeMandirMember(dataReader);
					MandirMemberList.Add(MandirMember);
				}

				return  Ok(new {MandirMemberList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the MandirMember class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  MandirMember MakeMandirMember(SqlDataReader dataReader)
		{
			MandirMember mandirMember = new MandirMember();
			mandirMember.MandirMemberID = DataAccess.GetInt32(dataReader, "MandirMemberID", 0);
			mandirMember.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			mandirMember.MandirID = DataAccess.GetInt32(dataReader, "MandirID", 0);
			mandirMember.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			mandirMember.MemberRole = DataAccess.GetString(dataReader, "MemberRole", String.Empty);
			mandirMember.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			mandirMember.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			mandirMember.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			mandirMember.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return mandirMember;
		}

	}
	}
