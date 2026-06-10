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
	public class FamilyAPI : ControllerBase
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
		/// Saves a record to the Family table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyInsert")]
		public  IActionResult FamilyInsert([FromBody] Family family)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", family.TenantID == 0 ? SqlInt32.Null : family.TenantID ),
				new SqlParameter("@UserID", family.UserID == 0 ? SqlInt32.Null : family.UserID ),
				new SqlParameter("@FamilyName", family.FamilyName),
				new SqlParameter("@FamilyDescription", family.FamilyDescription),
				new SqlParameter("@FamilyAddress", family.FamilyAddress),
				new SqlParameter("@IsActive", family.IsActive),
				new SqlParameter("@DateAdded", family.DateAdded == DateTime.MinValue ? SqlDateTime.Null : family.DateAdded ),
				new SqlParameter("@DateModified", family.DateModified == DateTime.MinValue ? SqlDateTime.Null : family.DateModified ),
				new SqlParameter("@UpdatedByUser", family.UpdatedByUser)
			};

			family.FamilyID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FamilyInsert", parameters));
			return Ok(new {FamilyID=family.FamilyID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the Family table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyUpdate")]
		public  IActionResult FamilyUpdate([FromBody] Family family)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyID", family.FamilyID == 0 ? SqlInt32.Null : family.FamilyID ),
				new SqlParameter("@TenantID", family.TenantID == 0 ? SqlInt32.Null : family.TenantID ),
				new SqlParameter("@UserID", family.UserID == 0 ? SqlInt32.Null : family.UserID ),
				new SqlParameter("@FamilyName", family.FamilyName),
				new SqlParameter("@FamilyDescription", family.FamilyDescription),
				new SqlParameter("@FamilyAddress", family.FamilyAddress),
				new SqlParameter("@IsActive", family.IsActive),
				new SqlParameter("@DateAdded", family.DateAdded == DateTime.MinValue ? SqlDateTime.Null : family.DateAdded ),
				new SqlParameter("@DateModified", family.DateModified == DateTime.MinValue ? SqlDateTime.Null : family.DateModified ),
				new SqlParameter("@UpdatedByUser", family.UpdatedByUser)
			};

			 var FamilyID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "FamilyUpdate", parameters));
			return Ok(new {FamilyID =FamilyID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the Family table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyDelete")]
		public  IActionResult FamilyDelete(int familyID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyID", familyID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var familyDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FamilyDelete", parameters));
			return Ok(new {FamilyID =familyDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Family table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilySelect")]
		public IActionResult FamilySelect(int familyID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyID", familyID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FamilySelect", parameters))
			{
				List<Family> FamilyList = new List<Family>();
				while (dataReader.Read())
				{
					Family Family = MakeFamily(dataReader);
					FamilyList.Add(Family);
				}

				return  Ok(new {FamilyList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Family table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilySelectAll")]
		public IActionResult FamilySelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FamilySelectAll", parameters))
			{
				List<Family> FamilyList = new List<Family>();
				while (dataReader.Read())
				{
					Family Family = MakeFamily(dataReader);
					FamilyList.Add(Family);
				}

				return  Ok(new {FamilyList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the Family table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilySelectAllByTenantID")]
		public  IActionResult FamilySelectAllByTenantID(int tenantID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FamilySelectAllByTenantID", parameters))
			{
				List<Family> FamilyList = new List<Family>();
				while (dataReader.Read())
				{
					Family Family = MakeFamily(dataReader);
					FamilyList.Add(Family);
				}

				return  Ok(new {FamilyList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the Family table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilySelectByQuery")]
		public  IActionResult FamilySelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FamilySelectByQuery", parameters))
			{
				List<Family> FamilyList = new List<Family>();
				while (dataReader.Read())
				{
					Family Family = MakeFamily(dataReader);
					FamilyList.Add(Family);
				}

				return  Ok(new {FamilyList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the Family class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  Family MakeFamily(SqlDataReader dataReader)
		{
			Family family = new Family();
			family.FamilyID = DataAccess.GetInt32(dataReader, "FamilyID", 0);
			family.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			family.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			family.FamilyName = DataAccess.GetString(dataReader, "FamilyName", String.Empty);
			family.FamilyDescription = DataAccess.GetString(dataReader, "FamilyDescription", String.Empty);
			family.FamilyAddress = DataAccess.GetString(dataReader, "FamilyAddress", String.Empty);
			family.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			family.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			family.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			family.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return family;
		}

	}
	}
