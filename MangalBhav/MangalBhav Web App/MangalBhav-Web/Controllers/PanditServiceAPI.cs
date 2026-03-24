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
	public class PanditServiceAPI : ControllerBase
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
		/// Saves a record to the PanditServices table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("PanditServicesInsert")]
		public  IActionResult PanditServicesInsert([FromBody] PanditService panditService)
		{
			return ApiHandler.Handle(() =>
			{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", panditService.TenantID == 0 ? SqlInt32.Null : panditService.TenantID ),
				new SqlParameter("@ProfileID", panditService.ProfileID == 0 ? SqlInt32.Null : panditService.ProfileID ),
				new SqlParameter("@ServiceID", panditService.ServiceID == 0 ? SqlInt32.Null : panditService.ServiceID ),
				new SqlParameter("@LocationID", panditService.LocationID == 0 ? SqlInt32.Null : panditService.LocationID ),
				new SqlParameter("@Price", panditService.Price),
				new SqlParameter("@IsActive", panditService.IsActive),
				new SqlParameter("@DateAdded", panditService.DateAdded == DateTime.MinValue ? SqlDateTime.Null : panditService.DateAdded ),
				new SqlParameter("@DateModified", panditService.DateModified == DateTime.MinValue ? SqlDateTime.Null : panditService.DateModified ),
				new SqlParameter("@UpdatedByUser", panditService.UpdatedByUser)
			};

			panditService.PanditServiceID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "PanditServicesInsert", parameters));
			return Ok(new {PanditServiceID=panditService.PanditServiceID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the PanditServices table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("PanditServicesUpdate")]
		public  IActionResult PanditServicesUpdate([FromBody] PanditService panditService)
		{
			return ApiHandler.Handle(() =>
			{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@PanditServiceID", panditService.PanditServiceID == 0 ? SqlInt32.Null : panditService.PanditServiceID ),
				new SqlParameter("@TenantID", panditService.TenantID == 0 ? SqlInt32.Null : panditService.TenantID ),
				new SqlParameter("@ProfileID", panditService.ProfileID == 0 ? SqlInt32.Null : panditService.ProfileID ),
				new SqlParameter("@ServiceID", panditService.ServiceID == 0 ? SqlInt32.Null : panditService.ServiceID ),
				new SqlParameter("@LocationID", panditService.LocationID == 0 ? SqlInt32.Null : panditService.LocationID ),
				new SqlParameter("@Price", panditService.Price),
				new SqlParameter("@IsActive", panditService.IsActive),
				new SqlParameter("@DateAdded", panditService.DateAdded == DateTime.MinValue ? SqlDateTime.Null : panditService.DateAdded ),
				new SqlParameter("@DateModified", panditService.DateModified == DateTime.MinValue ? SqlDateTime.Null : panditService.DateModified ),
				new SqlParameter("@UpdatedByUser", panditService.UpdatedByUser)
			};

			 var PanditServiceID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "PanditServicesUpdate", parameters));
			return Ok(new {PanditServiceID =PanditServiceID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the PanditServices table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("PanditServicesDelete")]
		public  IActionResult PanditServicesDelete(int panditServiceID, int tenantID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@PanditServiceID", panditServiceID)
				,new SqlParameter("@TenantID", tenantID)
			};

			 var panditServicesDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "PanditServicesDelete", parameters));
			return Ok(new {PanditServicesID =panditServicesDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the PanditServices table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("PanditServiceSelect")]
		public IActionResult PanditServiceSelect(int panditServiceID,int tenantID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@PanditServiceID", panditServiceID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "PanditServicesSelect", parameters))
			{
				List<PanditService> PanditServiceList = new List<PanditService>();
				while (dataReader.Read())
				{
					PanditService PanditService = MakePanditService(dataReader);
					PanditServiceList.Add(PanditService);
				}

				return  Ok(new {PanditServiceList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the PanditServices table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("PanditServiceSelectAll")]
		public IActionResult PanditServiceSelectAll(int tenantID ){
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "PanditServicesSelectAll", parameters))
			{
				List<PanditService> PanditServiceList = new List<PanditService>();
				while (dataReader.Read())
				{
					PanditService PanditService = MakePanditService(dataReader);
					PanditServiceList.Add(PanditService);
				}

				return  Ok(new {PanditServiceList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the PanditServices table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("PanditServicesSelectAllByLocationID")]
		public  IActionResult PanditServicesSelectAllByLocationID(int locationID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@LocationID", locationID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "PanditServicesSelectAllByLocationID", parameters))
			{
				List<PanditService> PanditServiceList = new List<PanditService>();
				while (dataReader.Read())
				{
					PanditService PanditService = MakePanditService(dataReader);
					PanditServiceList.Add(PanditService);
				}

				return  Ok(new {PanditServiceList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the PanditServices table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("PanditServicesSelectAllByProfileID")]
		public  IActionResult PanditServicesSelectAllByProfileID(int profileID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ProfileID", profileID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "PanditServicesSelectAllByProfileID", parameters))
			{
				List<PanditService> PanditServiceList = new List<PanditService>();
				while (dataReader.Read())
				{
					PanditService PanditService = MakePanditService(dataReader);
					PanditServiceList.Add(PanditService);
				}

				return  Ok(new {PanditServiceList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the PanditServices table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("PanditServicesSelectAllByServiceID")]
		public  IActionResult PanditServicesSelectAllByServiceID(int serviceID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@ServiceID", serviceID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "PanditServicesSelectAllByServiceID", parameters))
			{
				List<PanditService> PanditServiceList = new List<PanditService>();
				while (dataReader.Read())
				{
					PanditService PanditService = MakePanditService(dataReader);
					PanditServiceList.Add(PanditService);
				}

				return  Ok(new {PanditServiceList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the PanditServices table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("PanditServicesSelectAllByTenantID")]
		public  IActionResult PanditServicesSelectAllByTenantID(int tenantID)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "PanditServicesSelectAllByTenantID", parameters))
			{
				List<PanditService> PanditServiceList = new List<PanditService>();
				while (dataReader.Read())
				{
					PanditService PanditService = MakePanditService(dataReader);
					PanditServiceList.Add(PanditService);
				}

				return  Ok(new {PanditServiceList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the PanditServices table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("PanditServicesNUSelectByQuery")]
		public  IActionResult PanditServicesNUSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
			{
			SqlParameter[] parameters = new SqlParameter[]
			{
							new SqlParameter("@Query", Query)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "PanditServicesNUSelectByQuery", parameters))
			{
				List<PanditService> PanditServiceList = new List<PanditService>();
				while (dataReader.Read())
				{
					PanditService PanditService = MakePanditService(dataReader);
					PanditServiceList.Add(PanditService);
				}

				return  Ok(new {PanditServiceList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the PanditServices class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  PanditService MakePanditService(SqlDataReader dataReader)
		{
			PanditService panditService = new PanditService();
			panditService.PanditServiceID = DataAccess.GetInt32(dataReader, "PanditServiceID", 0);
			panditService.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			panditService.ProfileID = DataAccess.GetInt32(dataReader, "ProfileID", 0);
			panditService.ServiceID = DataAccess.GetInt32(dataReader, "ServiceID", 0);
			panditService.LocationID = DataAccess.GetInt32(dataReader, "LocationID", 0);
			panditService.Price = DataAccess.GetDecimal(dataReader, "Price", Decimal.Zero);
			panditService.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			panditService.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			panditService.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			panditService.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return panditService;
		}

	}
	}
