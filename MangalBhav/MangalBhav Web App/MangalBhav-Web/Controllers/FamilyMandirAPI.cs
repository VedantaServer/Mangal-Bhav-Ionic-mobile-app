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
	public class FamilyMandirAPI : ControllerBase
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
		/// Saves a record to the FamilyMandir table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMandirInsert")]
		public  IActionResult FamilyMandirInsert([FromBody] FamilyMandir familyMandir)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", familyMandir.TenantID == 0 ? SqlInt32.Null : familyMandir.TenantID ),
				new SqlParameter("@FamilyID", familyMandir.FamilyID == 0 ? SqlInt32.Null : familyMandir.FamilyID ),
				new SqlParameter("@MandirName", familyMandir.MandirName),
				new SqlParameter("@MandirDescription", familyMandir.MandirDescription),
				new SqlParameter("@GodName", familyMandir.GodName),
				new SqlParameter("@MandirPhoto1", familyMandir.MandirPhoto1),
				new SqlParameter("@MandirPhoto2", familyMandir.MandirPhoto2),
				new SqlParameter("@MandirPhoto3", familyMandir.MandirPhoto3),
				new SqlParameter("@AartiName1", familyMandir.AartiName1),
				new SqlParameter("@AartiName2", familyMandir.AartiName2),
				new SqlParameter("@AartiName3", familyMandir.AartiName3),
				new SqlParameter("@IsActive", familyMandir.IsActive),
				new SqlParameter("@DateAdded", familyMandir.DateAdded == DateTime.MinValue ? SqlDateTime.Null : familyMandir.DateAdded ),
				new SqlParameter("@DateModified", familyMandir.DateModified == DateTime.MinValue ? SqlDateTime.Null : familyMandir.DateModified ),
				new SqlParameter("@UpdatedByUser", familyMandir.UpdatedByUser)
			};

			familyMandir.FamilyMandirID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FamilyMandirInsert", parameters));
			return Ok(new {FamilyMandirID=familyMandir.FamilyMandirID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the FamilyMandir table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMandirUpdate")]
		public  IActionResult FamilyMandirUpdate([FromBody] FamilyMandir familyMandir)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyMandirID", familyMandir.FamilyMandirID == 0 ? SqlInt32.Null : familyMandir.FamilyMandirID ),
				new SqlParameter("@TenantID", familyMandir.TenantID == 0 ? SqlInt32.Null : familyMandir.TenantID ),
				new SqlParameter("@FamilyID", familyMandir.FamilyID == 0 ? SqlInt32.Null : familyMandir.FamilyID ),
				new SqlParameter("@MandirName", familyMandir.MandirName),
				new SqlParameter("@MandirDescription", familyMandir.MandirDescription),
				new SqlParameter("@GodName", familyMandir.GodName),
				new SqlParameter("@MandirPhoto1", familyMandir.MandirPhoto1),
				new SqlParameter("@MandirPhoto2", familyMandir.MandirPhoto2),
				new SqlParameter("@MandirPhoto3", familyMandir.MandirPhoto3),
				new SqlParameter("@AartiName1", familyMandir.AartiName1),
				new SqlParameter("@AartiName2", familyMandir.AartiName2),
				new SqlParameter("@AartiName3", familyMandir.AartiName3),
				new SqlParameter("@IsActive", familyMandir.IsActive),
				new SqlParameter("@DateAdded", familyMandir.DateAdded == DateTime.MinValue ? SqlDateTime.Null : familyMandir.DateAdded ),
				new SqlParameter("@DateModified", familyMandir.DateModified == DateTime.MinValue ? SqlDateTime.Null : familyMandir.DateModified ),
				new SqlParameter("@UpdatedByUser", familyMandir.UpdatedByUser)
			};

			 var FamilyMandirID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "FamilyMandirUpdate", parameters));
			return Ok(new {FamilyMandirID =FamilyMandirID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the FamilyMandir table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMandirDelete")]
		public  IActionResult FamilyMandirDelete(int familyMandirID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyMandirID", familyMandirID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var familyMandirDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FamilyMandirDelete", parameters));
			return Ok(new {FamilyMandirID =familyMandirDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FamilyMandir table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMandirSelect")]
		public IActionResult FamilyMandirSelect(int familyMandirID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyMandirID", familyMandirID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FamilyMandirSelect", parameters))
			{
				List<FamilyMandir> FamilyMandirList = new List<FamilyMandir>();
				while (dataReader.Read())
				{
					FamilyMandir FamilyMandir = MakeFamilyMandir(dataReader);
					FamilyMandirList.Add(FamilyMandir);
				}

				return  Ok(new {FamilyMandirList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FamilyMandir table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMandirSelectAll")]
		public IActionResult FamilyMandirSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FamilyMandirSelectAll", parameters))
			{
				List<FamilyMandir> FamilyMandirList = new List<FamilyMandir>();
				while (dataReader.Read())
				{
					FamilyMandir FamilyMandir = MakeFamilyMandir(dataReader);
					FamilyMandirList.Add(FamilyMandir);
				}

				return  Ok(new {FamilyMandirList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the FamilyMandir table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMandirSelectAllByFamilyID")]
		public  IActionResult FamilyMandirSelectAllByFamilyID(int familyID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyID", familyID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FamilyMandirSelectAllByFamilyID", parameters))
			{
				List<FamilyMandir> FamilyMandirList = new List<FamilyMandir>();
				while (dataReader.Read())
				{
					FamilyMandir FamilyMandir = MakeFamilyMandir(dataReader);
					FamilyMandirList.Add(FamilyMandir);
				}

				return  Ok(new {FamilyMandirList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the FamilyMandir table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMandirSelectAllByTenantID")]
		public  IActionResult FamilyMandirSelectAllByTenantID(int tenantID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FamilyMandirSelectAllByTenantID", parameters))
			{
				List<FamilyMandir> FamilyMandirList = new List<FamilyMandir>();
				while (dataReader.Read())
				{
					FamilyMandir FamilyMandir = MakeFamilyMandir(dataReader);
					FamilyMandirList.Add(FamilyMandir);
				}

				return  Ok(new {FamilyMandirList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the FamilyMandir table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMandirSelectByQuery")]
		public  IActionResult FamilyMandirSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FamilyMandirSelectByQuery", parameters))
			{
				List<FamilyMandir> FamilyMandirList = new List<FamilyMandir>();
				while (dataReader.Read())
				{
					FamilyMandir FamilyMandir = MakeFamilyMandir(dataReader);
					FamilyMandirList.Add(FamilyMandir);
				}

				return  Ok(new {FamilyMandirList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the FamilyMandir class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  FamilyMandir MakeFamilyMandir(SqlDataReader dataReader)
		{
			FamilyMandir familyMandir = new FamilyMandir();
			familyMandir.FamilyMandirID = DataAccess.GetInt32(dataReader, "FamilyMandirID", 0);
			familyMandir.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			familyMandir.FamilyID = DataAccess.GetInt32(dataReader, "FamilyID", 0);
			familyMandir.MandirName = DataAccess.GetString(dataReader, "MandirName", String.Empty);
			familyMandir.MandirDescription = DataAccess.GetString(dataReader, "MandirDescription", String.Empty);
			familyMandir.GodName = DataAccess.GetString(dataReader, "GodName", String.Empty);
			familyMandir.MandirPhoto1 = DataAccess.GetString(dataReader, "MandirPhoto1", String.Empty);
			familyMandir.MandirPhoto2 = DataAccess.GetString(dataReader, "MandirPhoto2", String.Empty);
			familyMandir.MandirPhoto3 = DataAccess.GetString(dataReader, "MandirPhoto3", String.Empty);
			familyMandir.AartiName1 = DataAccess.GetString(dataReader, "AartiName1", String.Empty);
			familyMandir.AartiName2 = DataAccess.GetString(dataReader, "AartiName2", String.Empty);
			familyMandir.AartiName3 = DataAccess.GetString(dataReader, "AartiName3", String.Empty);
			familyMandir.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			familyMandir.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			familyMandir.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			familyMandir.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return familyMandir;
		}

	}
	}
