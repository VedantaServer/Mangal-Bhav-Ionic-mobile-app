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
	public class FamilyMemberAPI : ControllerBase
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
		/// Saves a record to the FamilyMembers table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMembersInsert")]
		public  IActionResult FamilyMembersInsert([FromBody] FamilyMember familyMember)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", familyMember.TenantID == 0 ? SqlInt32.Null : familyMember.TenantID ),
				new SqlParameter("@FamilyID", familyMember.FamilyID == 0 ? SqlInt32.Null : familyMember.FamilyID ),
				new SqlParameter("@UserID", familyMember.UserID == 0 ? SqlInt32.Null : familyMember.UserID ),
				new SqlParameter("@IsActive", familyMember.IsActive),
				new SqlParameter("@DateAdded", familyMember.DateAdded == DateTime.MinValue ? SqlDateTime.Null : familyMember.DateAdded ),
				new SqlParameter("@DateModified", familyMember.DateModified == DateTime.MinValue ? SqlDateTime.Null : familyMember.DateModified ),
				new SqlParameter("@UpdatedByUser", familyMember.UpdatedByUser)
			};

			familyMember.FamilyMembersID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FamilyMembersInsert", parameters));
			return Ok(new {FamilyMembersID=familyMember.FamilyMembersID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the FamilyMembers table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMembersUpdate")]
		public  IActionResult FamilyMembersUpdate([FromBody] FamilyMember familyMember)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyMembersID", familyMember.FamilyMembersID == 0 ? SqlInt32.Null : familyMember.FamilyMembersID ),
				new SqlParameter("@TenantID", familyMember.TenantID == 0 ? SqlInt32.Null : familyMember.TenantID ),
				new SqlParameter("@FamilyID", familyMember.FamilyID == 0 ? SqlInt32.Null : familyMember.FamilyID ),
				new SqlParameter("@UserID", familyMember.UserID == 0 ? SqlInt32.Null : familyMember.UserID ),
				new SqlParameter("@IsActive", familyMember.IsActive),
				new SqlParameter("@DateAdded", familyMember.DateAdded == DateTime.MinValue ? SqlDateTime.Null : familyMember.DateAdded ),
				new SqlParameter("@DateModified", familyMember.DateModified == DateTime.MinValue ? SqlDateTime.Null : familyMember.DateModified ),
				new SqlParameter("@UpdatedByUser", familyMember.UpdatedByUser)
			};

			 var FamilyMemberID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "FamilyMembersUpdate", parameters));
			return Ok(new {FamilyMemberID =FamilyMemberID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the FamilyMembers table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMembersDelete")]
		public  IActionResult FamilyMembersDelete(int familyMembersID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyMembersID", familyMembersID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var familyMembersDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FamilyMembersDelete", parameters));
			return Ok(new {FamilyMembersID =familyMembersDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FamilyMembers table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMemberSelect")]
		public IActionResult FamilyMemberSelect(int familyMembersID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyMembersID", familyMembersID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FamilyMembersSelect", parameters))
			{
				List<FamilyMember> FamilyMemberList = new List<FamilyMember>();
				while (dataReader.Read())
				{
					FamilyMember FamilyMember = MakeFamilyMember(dataReader);
					FamilyMemberList.Add(FamilyMember);
				}

				return  Ok(new {FamilyMemberList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FamilyMembers table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMemberSelectAll")]
		public IActionResult FamilyMemberSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FamilyMembersSelectAll", parameters))
			{
				List<FamilyMember> FamilyMemberList = new List<FamilyMember>();
				while (dataReader.Read())
				{
					FamilyMember FamilyMember = MakeFamilyMember(dataReader);
					FamilyMemberList.Add(FamilyMember);
				}

				return  Ok(new {FamilyMemberList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the FamilyMembers table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMembersSelectAllByFamilyID")]
		public  IActionResult FamilyMembersSelectAllByFamilyID(int familyID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyID", familyID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FamilyMembersSelectAllByFamilyID", parameters))
			{
				List<FamilyMember> FamilyMemberList = new List<FamilyMember>();
				while (dataReader.Read())
				{
					FamilyMember FamilyMember = MakeFamilyMember(dataReader);
					FamilyMemberList.Add(FamilyMember);
				}

				return  Ok(new {FamilyMemberList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the FamilyMembers table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMembersSelectAllByTenantID")]
		public  IActionResult FamilyMembersSelectAllByTenantID(int tenantID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FamilyMembersSelectAllByTenantID", parameters))
			{
				List<FamilyMember> FamilyMemberList = new List<FamilyMember>();
				while (dataReader.Read())
				{
					FamilyMember FamilyMember = MakeFamilyMember(dataReader);
					FamilyMemberList.Add(FamilyMember);
				}

				return  Ok(new {FamilyMemberList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the FamilyMembers table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMembersSelectByQuery")]
		public  IActionResult FamilyMembersSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FamilyMembersSelectByQuery", parameters))
			{
				List<FamilyMember> FamilyMemberList = new List<FamilyMember>();
				while (dataReader.Read())
				{
					FamilyMember FamilyMember = MakeFamilyMember(dataReader);
					FamilyMemberList.Add(FamilyMember);
				}

				return  Ok(new {FamilyMemberList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the FamilyMembers class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  FamilyMember MakeFamilyMember(SqlDataReader dataReader)
		{
			FamilyMember familyMember = new FamilyMember();
			familyMember.FamilyMembersID = DataAccess.GetInt32(dataReader, "FamilyMembersID", 0);
			familyMember.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			familyMember.FamilyID = DataAccess.GetInt32(dataReader, "FamilyID", 0);
			familyMember.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			familyMember.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			familyMember.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			familyMember.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			familyMember.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return familyMember;
		}

	}
	}
