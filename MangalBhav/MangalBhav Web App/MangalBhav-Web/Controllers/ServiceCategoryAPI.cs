using System;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Microsoft.Data.SqlClient;
using System.Data.SqlTypes;
using System.Collections.Generic;
using FaceUPAI.Models;
using FaceUPAI.DataAccessService;
using FaceUPAI.Controllers.Common;
using Microsoft.AspNetCore.Cors;

namespace FaceUPAI.API
{
	public class ServiceCategoryAPI : ControllerBase
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
		/// Saves a record to the ServiceCategory table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategoryInsert")]
		public  IActionResult ServiceCategoryInsert([FromBody] ServiceCategory serviceCategory)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@CategoryName", serviceCategory.CategoryName),
				new SqlParameter("@CategoryName_HI", serviceCategory.CategoryName_HI),
				new SqlParameter("@Description", serviceCategory.Description),
				new SqlParameter("@Description_HI", serviceCategory.Description_HI),
				new SqlParameter("@MinAge", serviceCategory.MinAge == 0 ? SqlInt32.Null : serviceCategory.MinAge ),
				new SqlParameter("@MaxAge", serviceCategory.MaxAge == 0 ? SqlInt32.Null : serviceCategory.MaxAge ),
				new SqlParameter("@AgeText", serviceCategory.AgeText),
				new SqlParameter("@Gender", serviceCategory.Gender),
				new SqlParameter("@RitualType", serviceCategory.RitualType),
				new SqlParameter("@IsLifeEvent", serviceCategory.IsLifeEvent),
				new SqlParameter("@IsFestivalRelated", serviceCategory.IsFestivalRelated),
				new SqlParameter("@TenantID", serviceCategory.TenantID == 0 ? SqlInt32.Null : serviceCategory.TenantID ),
				new SqlParameter("@IsActive", serviceCategory.IsActive),
				new SqlParameter("@DateAdded", serviceCategory.DateAdded == DateTime.MinValue ? SqlDateTime.Null : serviceCategory.DateAdded ),
				new SqlParameter("@DateModified", serviceCategory.DateModified == DateTime.MinValue ? SqlDateTime.Null : serviceCategory.DateModified ),
				new SqlParameter("@UpdatedByUser", serviceCategory.UpdatedByUser)
			};

			serviceCategory.CategoryID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ServiceCategoryInsert", parameters));
			return Ok(new {CategoryID=serviceCategory.CategoryID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the ServiceCategory table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategoryUpdate")]
		public  IActionResult ServiceCategoryUpdate([FromBody] ServiceCategory serviceCategory)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@CategoryID", serviceCategory.CategoryID == 0 ? SqlInt32.Null : serviceCategory.CategoryID ),
				new SqlParameter("@CategoryName", serviceCategory.CategoryName),
				new SqlParameter("@CategoryName_HI", serviceCategory.CategoryName_HI),
				new SqlParameter("@Description", serviceCategory.Description),
				new SqlParameter("@Description_HI", serviceCategory.Description_HI),
				new SqlParameter("@MinAge", serviceCategory.MinAge == 0 ? SqlInt32.Null : serviceCategory.MinAge ),
				new SqlParameter("@MaxAge", serviceCategory.MaxAge == 0 ? SqlInt32.Null : serviceCategory.MaxAge ),
				new SqlParameter("@AgeText", serviceCategory.AgeText),
				new SqlParameter("@Gender", serviceCategory.Gender),
				new SqlParameter("@RitualType", serviceCategory.RitualType),
				new SqlParameter("@IsLifeEvent", serviceCategory.IsLifeEvent),
				new SqlParameter("@IsFestivalRelated", serviceCategory.IsFestivalRelated),
				new SqlParameter("@TenantID", serviceCategory.TenantID == 0 ? SqlInt32.Null : serviceCategory.TenantID ),
				new SqlParameter("@IsActive", serviceCategory.IsActive),
				new SqlParameter("@DateAdded", serviceCategory.DateAdded == DateTime.MinValue ? SqlDateTime.Null : serviceCategory.DateAdded ),
				new SqlParameter("@DateModified", serviceCategory.DateModified == DateTime.MinValue ? SqlDateTime.Null : serviceCategory.DateModified ),
				new SqlParameter("@UpdatedByUser", serviceCategory.UpdatedByUser)
			};

			 var ServiceCategoryID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ServiceCategoryUpdate", parameters));
			return Ok(new {ServiceCategoryID =ServiceCategoryID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the ServiceCategory table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategoryDelete")]
		public  IActionResult ServiceCategoryDelete(int categoryID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@CategoryID", categoryID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var serviceCategoryDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ServiceCategoryDelete", parameters));
			return Ok(new {ServiceCategoryID =serviceCategoryDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ServiceCategory table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategorySelect")]
		public IActionResult ServiceCategorySelect(int categoryID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@CategoryID", categoryID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ServiceCategorySelect", parameters))
			{
				List<ServiceCategory> ServiceCategoryList = new List<ServiceCategory>();
				while (dataReader.Read())
				{
					ServiceCategory ServiceCategory = MakeServiceCategory(dataReader);
					ServiceCategoryList.Add(ServiceCategory);
				}

				return  Ok(new {ServiceCategoryList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ServiceCategory table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategorySelectAll")]
		public IActionResult ServiceCategorySelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ServiceCategorySelectAll", parameters))
			{
				List<ServiceCategory> ServiceCategoryList = new List<ServiceCategory>();
				while (dataReader.Read())
				{
					ServiceCategory ServiceCategory = MakeServiceCategory(dataReader);
					ServiceCategoryList.Add(ServiceCategory);
				}

				return  Ok(new {ServiceCategoryList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the ServiceCategory table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategorySelectByQuery")]
		public  IActionResult ServiceCategorySelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ServiceCategorySelectByQuery", parameters))
			{
				List<ServiceCategory> ServiceCategoryList = new List<ServiceCategory>();
				while (dataReader.Read())
				{
					ServiceCategory ServiceCategory = MakeServiceCategory(dataReader);
					ServiceCategoryList.Add(ServiceCategory);
				}

				return  Ok(new {ServiceCategoryList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the ServiceCategory class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  ServiceCategory MakeServiceCategory(SqlDataReader dataReader)
		{
			ServiceCategory serviceCategory = new ServiceCategory();
			serviceCategory.CategoryID = DataAccess.GetInt32(dataReader, "CategoryID", 0);
			serviceCategory.CategoryName = DataAccess.GetString(dataReader, "CategoryName", String.Empty);
			serviceCategory.CategoryName_HI = DataAccess.GetString(dataReader, "CategoryName_HI", String.Empty);
			serviceCategory.Description = DataAccess.GetString(dataReader, "Description", String.Empty);
			serviceCategory.Description_HI = DataAccess.GetString(dataReader, "Description_HI", String.Empty);
			serviceCategory.MinAge = DataAccess.GetInt32(dataReader, "MinAge", 0);
			serviceCategory.MaxAge = DataAccess.GetInt32(dataReader, "MaxAge", 0);
			serviceCategory.AgeText = DataAccess.GetString(dataReader, "AgeText", String.Empty);
			serviceCategory.Gender = DataAccess.GetString(dataReader, "Gender", String.Empty);
			serviceCategory.RitualType = DataAccess.GetString(dataReader, "RitualType", String.Empty);
			serviceCategory.IsLifeEvent = DataAccess.GetBoolean(dataReader, "IsLifeEvent", false);
			serviceCategory.IsFestivalRelated = DataAccess.GetBoolean(dataReader, "IsFestivalRelated", false);
			serviceCategory.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			serviceCategory.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			serviceCategory.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			serviceCategory.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			serviceCategory.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return serviceCategory;
		}

	}
	}
