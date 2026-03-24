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
	public class ServiceCategoryMappingAPI : ControllerBase
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
		/// Saves a record to the ServiceCategoryMapping table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategoryMappingInsert")]
		public  IActionResult ServiceCategoryMappingInsert([FromBody] ServiceCategoryMapping serviceCategoryMapping)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ServiceID", serviceCategoryMapping.ServiceID == 0 ? SqlInt32.Null : serviceCategoryMapping.ServiceID ),
				new SqlParameter("@CategoryID", serviceCategoryMapping.CategoryID == 0 ? SqlInt32.Null : serviceCategoryMapping.CategoryID ),
				new SqlParameter("@TenantID", serviceCategoryMapping.TenantID == 0 ? SqlInt32.Null : serviceCategoryMapping.TenantID ),
				new SqlParameter("@IsActive", serviceCategoryMapping.IsActive),
				new SqlParameter("@DateAdded", serviceCategoryMapping.DateAdded == DateTime.MinValue ? SqlDateTime.Null : serviceCategoryMapping.DateAdded )
			};

			serviceCategoryMapping.MappingID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ServiceCategoryMappingInsert", parameters));
			return Ok(new {MappingID=serviceCategoryMapping.MappingID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the ServiceCategoryMapping table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategoryMappingUpdate")]
		public  IActionResult ServiceCategoryMappingUpdate([FromBody] ServiceCategoryMapping serviceCategoryMapping)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MappingID", serviceCategoryMapping.MappingID == 0 ? SqlInt32.Null : serviceCategoryMapping.MappingID ),
				new SqlParameter("@ServiceID", serviceCategoryMapping.ServiceID == 0 ? SqlInt32.Null : serviceCategoryMapping.ServiceID ),
				new SqlParameter("@CategoryID", serviceCategoryMapping.CategoryID == 0 ? SqlInt32.Null : serviceCategoryMapping.CategoryID ),
				new SqlParameter("@TenantID", serviceCategoryMapping.TenantID == 0 ? SqlInt32.Null : serviceCategoryMapping.TenantID ),
				new SqlParameter("@IsActive", serviceCategoryMapping.IsActive),
				new SqlParameter("@DateAdded", serviceCategoryMapping.DateAdded == DateTime.MinValue ? SqlDateTime.Null : serviceCategoryMapping.DateAdded )
			};

			 var ServiceCategoryMappingID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ServiceCategoryMappingUpdate", parameters));
			return Ok(new {ServiceCategoryMappingID =ServiceCategoryMappingID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the ServiceCategoryMapping table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategoryMappingDelete")]
		public  IActionResult ServiceCategoryMappingDelete(int mappingID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MappingID", mappingID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var serviceCategoryMappingDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ServiceCategoryMappingDelete", parameters));
			return Ok(new {ServiceCategoryMappingID =serviceCategoryMappingDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ServiceCategoryMapping table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategoryMappingSelect")]
		public IActionResult ServiceCategoryMappingSelect(int mappingID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MappingID", mappingID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ServiceCategoryMappingSelect", parameters))
			{
				List<ServiceCategoryMapping> ServiceCategoryMappingList = new List<ServiceCategoryMapping>();
				while (dataReader.Read())
				{
					ServiceCategoryMapping ServiceCategoryMapping = MakeServiceCategoryMapping(dataReader);
					ServiceCategoryMappingList.Add(ServiceCategoryMapping);
				}

				return  Ok(new {ServiceCategoryMappingList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the ServiceCategoryMapping table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategoryMappingSelectAll")]
		public IActionResult ServiceCategoryMappingSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ServiceCategoryMappingSelectAll", parameters))
			{
				List<ServiceCategoryMapping> ServiceCategoryMappingList = new List<ServiceCategoryMapping>();
				while (dataReader.Read())
				{
					ServiceCategoryMapping ServiceCategoryMapping = MakeServiceCategoryMapping(dataReader);
					ServiceCategoryMappingList.Add(ServiceCategoryMapping);
				}

				return  Ok(new {ServiceCategoryMappingList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the ServiceCategoryMapping table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategoryMappingSelectAllByCategoryID")]
		public  IActionResult ServiceCategoryMappingSelectAllByCategoryID(int categoryID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@CategoryID", categoryID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ServiceCategoryMappingSelectAllByCategoryID", parameters))
			{
				List<ServiceCategoryMapping> ServiceCategoryMappingList = new List<ServiceCategoryMapping>();
				while (dataReader.Read())
				{
					ServiceCategoryMapping ServiceCategoryMapping = MakeServiceCategoryMapping(dataReader);
					ServiceCategoryMappingList.Add(ServiceCategoryMapping);
				}

				return  Ok(new {ServiceCategoryMappingList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the ServiceCategoryMapping table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategoryMappingSelectAllByServiceID")]
		public  IActionResult ServiceCategoryMappingSelectAllByServiceID(int serviceID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ServiceID", serviceID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ServiceCategoryMappingSelectAllByServiceID", parameters))
			{
				List<ServiceCategoryMapping> ServiceCategoryMappingList = new List<ServiceCategoryMapping>();
				while (dataReader.Read())
				{
					ServiceCategoryMapping ServiceCategoryMapping = MakeServiceCategoryMapping(dataReader);
					ServiceCategoryMappingList.Add(ServiceCategoryMapping);
				}

				return  Ok(new {ServiceCategoryMappingList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the ServiceCategoryMapping table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceCategoryMappingSelectByQuery")]
		public  IActionResult ServiceCategoryMappingSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ServiceCategoryMappingSelectByQuery", parameters))
			{
				List<ServiceCategoryMapping> ServiceCategoryMappingList = new List<ServiceCategoryMapping>();
				while (dataReader.Read())
				{
					ServiceCategoryMapping ServiceCategoryMapping = MakeServiceCategoryMapping(dataReader);
					ServiceCategoryMappingList.Add(ServiceCategoryMapping);
				}

				return  Ok(new {ServiceCategoryMappingList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the ServiceCategoryMapping class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  ServiceCategoryMapping MakeServiceCategoryMapping(SqlDataReader dataReader)
		{
			ServiceCategoryMapping serviceCategoryMapping = new ServiceCategoryMapping();
			serviceCategoryMapping.MappingID = DataAccess.GetInt32(dataReader, "MappingID", 0);
			serviceCategoryMapping.ServiceID = DataAccess.GetInt32(dataReader, "ServiceID", 0);
			serviceCategoryMapping.CategoryID = DataAccess.GetInt32(dataReader, "CategoryID", 0);
			serviceCategoryMapping.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			serviceCategoryMapping.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			serviceCategoryMapping.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);

			return serviceCategoryMapping;
		}

	}
	}
