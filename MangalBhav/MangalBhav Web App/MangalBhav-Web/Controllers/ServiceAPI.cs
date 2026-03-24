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
	public class ServiceAPI : ControllerBase
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
		/// Saves a record to the Services table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServicesInsert")]
		public  IActionResult ServicesInsert([FromBody] Service service)
		{
			return ApiHandler.Handle(() =>
			{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", service.TenantID == 0 ? SqlInt32.Null : service.TenantID ),
				new SqlParameter("@Name", service.Name),
				new SqlParameter("@Description", service.Description),
				new SqlParameter("@DurationMinutes", service.DurationMinutes == 0 ? SqlInt32.Null : service.DurationMinutes ),
				new SqlParameter("@IsActive", service.IsActive),
				new SqlParameter("@DateAdded", service.DateAdded == DateTime.MinValue ? SqlDateTime.Null : service.DateAdded ),
				new SqlParameter("@DateModified", service.DateModified == DateTime.MinValue ? SqlDateTime.Null : service.DateModified ),
				new SqlParameter("@UpdatedByUser", service.UpdatedByUser)
			};

			service.ServiceID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ServicesInsert", parameters));
			return Ok(new {ServiceID=service.ServiceID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the Services table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServicesUpdate")]
		public  IActionResult ServicesUpdate([FromBody] Service service)
		{
			return ApiHandler.Handle(() =>
			{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ServiceID", service.ServiceID == 0 ? SqlInt32.Null : service.ServiceID ),
				new SqlParameter("@TenantID", service.TenantID == 0 ? SqlInt32.Null : service.TenantID ),
				new SqlParameter("@Name", service.Name),
				new SqlParameter("@Description", service.Description),
				new SqlParameter("@DurationMinutes", service.DurationMinutes == 0 ? SqlInt32.Null : service.DurationMinutes ),
				new SqlParameter("@IsActive", service.IsActive),
				new SqlParameter("@DateAdded", service.DateAdded == DateTime.MinValue ? SqlDateTime.Null : service.DateAdded ),
				new SqlParameter("@DateModified", service.DateModified == DateTime.MinValue ? SqlDateTime.Null : service.DateModified ),
				new SqlParameter("@UpdatedByUser", service.UpdatedByUser)
			};

			 var ServiceID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "ServicesUpdate", parameters));
			return Ok(new {ServiceID =ServiceID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the Services table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServicesDelete")]
		public  IActionResult ServicesDelete(int serviceID, int tenantID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ServiceID", serviceID)
				,new SqlParameter("@TenantID", tenantID)
			};

			 var servicesDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "ServicesDelete", parameters));
			return Ok(new {ServicesID =servicesDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Services table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceSelect")]
		public IActionResult ServiceSelect(int serviceID,int tenantID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ServiceID", serviceID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ServicesSelect", parameters))
			{
				List<Service> ServiceList = new List<Service>();
				while (dataReader.Read())
				{
					Service Service = MakeService(dataReader);
					ServiceList.Add(Service);
				}

				return  Ok(new {ServiceList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Services table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServiceSelectAll")]
		public IActionResult ServiceSelectAll(int tenantID ){
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "ServicesSelectAll", parameters))
			{
				List<Service> ServiceList = new List<Service>();
				while (dataReader.Read())
				{
					Service Service = MakeService(dataReader);
					ServiceList.Add(Service);
				}

				return  Ok(new {ServiceList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the Services table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServicesSelectAllByTenantID")]
		public  IActionResult ServicesSelectAllByTenantID(int tenantID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ServicesSelectAllByTenantID", parameters))
			{
				List<Service> ServiceList = new List<Service>();
				while (dataReader.Read())
				{
					Service Service = MakeService(dataReader);
					ServiceList.Add(Service);
				}

				return  Ok(new {ServiceList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the Services table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("ServicesNUSelectByQuery")]
		public  IActionResult ServicesNUSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
								new SqlParameter("@Query", Query)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "ServicesNUSelectByQuery", parameters))
			{
				List<Service> ServiceList = new List<Service>();
				while (dataReader.Read())
				{
					Service Service = MakeService(dataReader);
					ServiceList.Add(Service);
				}

				return  Ok(new {ServiceList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the Services class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  Service MakeService(SqlDataReader dataReader)
		{
			Service service = new Service();
			service.ServiceID = DataAccess.GetInt32(dataReader, "ServiceID", 0);
			service.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			service.Name = DataAccess.GetString(dataReader, "Name", String.Empty);
			service.Description = DataAccess.GetString(dataReader, "Description", String.Empty);
			service.DurationMinutes = DataAccess.GetInt32(dataReader, "DurationMinutes", 0);
			service.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			service.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			service.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			service.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return service;
		}

	}
	}
