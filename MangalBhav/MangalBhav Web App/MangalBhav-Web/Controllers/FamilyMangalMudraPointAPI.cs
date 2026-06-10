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
	public class FamilyMangalMudraPointAPI : ControllerBase
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
		/// Saves a record to the FamilyMangalMudraPoints table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMangalMudraPointsInsert")]
		public  IActionResult FamilyMangalMudraPointsInsert([FromBody] FamilyMangalMudraPoint familyMangalMudraPoint)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", familyMangalMudraPoint.TenantID == 0 ? SqlInt32.Null : familyMangalMudraPoint.TenantID ),
				new SqlParameter("@FamilyID", familyMangalMudraPoint.FamilyID == 0 ? SqlInt32.Null : familyMangalMudraPoint.FamilyID ),
				new SqlParameter("@UserID", familyMangalMudraPoint.UserID == 0 ? SqlInt32.Null : familyMangalMudraPoint.UserID ),
				new SqlParameter("@PointsCount", familyMangalMudraPoint.PointsCount),
				new SqlParameter("@IsActive", familyMangalMudraPoint.IsActive),
				new SqlParameter("@DateAdded", familyMangalMudraPoint.DateAdded == DateTime.MinValue ? SqlDateTime.Null : familyMangalMudraPoint.DateAdded ),
				new SqlParameter("@DateModified", familyMangalMudraPoint.DateModified == DateTime.MinValue ? SqlDateTime.Null : familyMangalMudraPoint.DateModified ),
				new SqlParameter("@UpdatedByUser", familyMangalMudraPoint.UpdatedByUser)
			};

			familyMangalMudraPoint.FamilyMangalMudraPointsID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FamilyMangalMudraPointsInsert", parameters));
			return Ok(new {FamilyMangalMudraPointsID=familyMangalMudraPoint.FamilyMangalMudraPointsID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the FamilyMangalMudraPoints table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMangalMudraPointsUpdate")]
		public  IActionResult FamilyMangalMudraPointsUpdate([FromBody] FamilyMangalMudraPoint familyMangalMudraPoint)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyMangalMudraPointsID", familyMangalMudraPoint.FamilyMangalMudraPointsID == 0 ? SqlInt32.Null : familyMangalMudraPoint.FamilyMangalMudraPointsID ),
				new SqlParameter("@TenantID", familyMangalMudraPoint.TenantID == 0 ? SqlInt32.Null : familyMangalMudraPoint.TenantID ),
				new SqlParameter("@FamilyID", familyMangalMudraPoint.FamilyID == 0 ? SqlInt32.Null : familyMangalMudraPoint.FamilyID ),
				new SqlParameter("@UserID", familyMangalMudraPoint.UserID == 0 ? SqlInt32.Null : familyMangalMudraPoint.UserID ),
				new SqlParameter("@PointsCount", familyMangalMudraPoint.PointsCount),
				new SqlParameter("@IsActive", familyMangalMudraPoint.IsActive),
				new SqlParameter("@DateAdded", familyMangalMudraPoint.DateAdded == DateTime.MinValue ? SqlDateTime.Null : familyMangalMudraPoint.DateAdded ),
				new SqlParameter("@DateModified", familyMangalMudraPoint.DateModified == DateTime.MinValue ? SqlDateTime.Null : familyMangalMudraPoint.DateModified ),
				new SqlParameter("@UpdatedByUser", familyMangalMudraPoint.UpdatedByUser)
			};

			 var FamilyMangalMudraPointID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "FamilyMangalMudraPointsUpdate", parameters));
			return Ok(new {FamilyMangalMudraPointID =FamilyMangalMudraPointID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the FamilyMangalMudraPoints table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMangalMudraPointsDelete")]
		public  IActionResult FamilyMangalMudraPointsDelete(int familyMangalMudraPointsID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyMangalMudraPointsID", familyMangalMudraPointsID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var familyMangalMudraPointsDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FamilyMangalMudraPointsDelete", parameters));
			return Ok(new {FamilyMangalMudraPointsID =familyMangalMudraPointsDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FamilyMangalMudraPoints table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMangalMudraPointSelect")]
		public IActionResult FamilyMangalMudraPointSelect(int familyMangalMudraPointsID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyMangalMudraPointsID", familyMangalMudraPointsID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FamilyMangalMudraPointsSelect", parameters))
			{
				List<FamilyMangalMudraPoint> FamilyMangalMudraPointList = new List<FamilyMangalMudraPoint>();
				while (dataReader.Read())
				{
					FamilyMangalMudraPoint FamilyMangalMudraPoint = MakeFamilyMangalMudraPoint(dataReader);
					FamilyMangalMudraPointList.Add(FamilyMangalMudraPoint);
				}

				return  Ok(new {FamilyMangalMudraPointList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the FamilyMangalMudraPoints table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMangalMudraPointSelectAll")]
		public IActionResult FamilyMangalMudraPointSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FamilyMangalMudraPointsSelectAll", parameters))
			{
				List<FamilyMangalMudraPoint> FamilyMangalMudraPointList = new List<FamilyMangalMudraPoint>();
				while (dataReader.Read())
				{
					FamilyMangalMudraPoint FamilyMangalMudraPoint = MakeFamilyMangalMudraPoint(dataReader);
					FamilyMangalMudraPointList.Add(FamilyMangalMudraPoint);
				}

				return  Ok(new {FamilyMangalMudraPointList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the FamilyMangalMudraPoints table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMangalMudraPointsSelectAllByFamilyID")]
		public  IActionResult FamilyMangalMudraPointsSelectAllByFamilyID(int familyID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FamilyID", familyID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FamilyMangalMudraPointsSelectAllByFamilyID", parameters))
			{
				List<FamilyMangalMudraPoint> FamilyMangalMudraPointList = new List<FamilyMangalMudraPoint>();
				while (dataReader.Read())
				{
					FamilyMangalMudraPoint FamilyMangalMudraPoint = MakeFamilyMangalMudraPoint(dataReader);
					FamilyMangalMudraPointList.Add(FamilyMangalMudraPoint);
				}

				return  Ok(new {FamilyMangalMudraPointList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the FamilyMangalMudraPoints table by a foreign key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMangalMudraPointsSelectAllByTenantID")]
		public  IActionResult FamilyMangalMudraPointsSelectAllByTenantID(int tenantID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FamilyMangalMudraPointsSelectAllByTenantID", parameters))
			{
				List<FamilyMangalMudraPoint> FamilyMangalMudraPointList = new List<FamilyMangalMudraPoint>();
				while (dataReader.Read())
				{
					FamilyMangalMudraPoint FamilyMangalMudraPoint = MakeFamilyMangalMudraPoint(dataReader);
					FamilyMangalMudraPointList.Add(FamilyMangalMudraPoint);
				}

				return  Ok(new {FamilyMangalMudraPointList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the FamilyMangalMudraPoints table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("FamilyMangalMudraPointsSelectByQuery")]
		public  IActionResult FamilyMangalMudraPointsSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FamilyMangalMudraPointsSelectByQuery", parameters))
			{
				List<FamilyMangalMudraPoint> FamilyMangalMudraPointList = new List<FamilyMangalMudraPoint>();
				while (dataReader.Read())
				{
					FamilyMangalMudraPoint FamilyMangalMudraPoint = MakeFamilyMangalMudraPoint(dataReader);
					FamilyMangalMudraPointList.Add(FamilyMangalMudraPoint);
				}

				return  Ok(new {FamilyMangalMudraPointList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the FamilyMangalMudraPoints class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  FamilyMangalMudraPoint MakeFamilyMangalMudraPoint(SqlDataReader dataReader)
		{
			FamilyMangalMudraPoint familyMangalMudraPoint = new FamilyMangalMudraPoint();
			familyMangalMudraPoint.FamilyMangalMudraPointsID = DataAccess.GetInt32(dataReader, "FamilyMangalMudraPointsID", 0);
			familyMangalMudraPoint.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			familyMangalMudraPoint.FamilyID = DataAccess.GetInt32(dataReader, "FamilyID", 0);
			familyMangalMudraPoint.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			familyMangalMudraPoint.PointsCount = DataAccess.GetString(dataReader, "PointsCount", String.Empty);
			familyMangalMudraPoint.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			familyMangalMudraPoint.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			familyMangalMudraPoint.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			familyMangalMudraPoint.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return familyMangalMudraPoint;
		}

	}
	}
