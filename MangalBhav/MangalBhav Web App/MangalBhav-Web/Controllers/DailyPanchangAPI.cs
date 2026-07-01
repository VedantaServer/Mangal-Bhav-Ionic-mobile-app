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
	public class DailyPanchangAPI : ControllerBase
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
		/// Saves a record to the DailyPanchang table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("DailyPanchangInsert")]
		public  IActionResult DailyPanchangInsert([FromBody] DailyPanchang dailyPanchang)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@SectionHeading", dailyPanchang.SectionHeading),
				new SqlParameter("@Key1", dailyPanchang.Key1),
				new SqlParameter("@Value1", dailyPanchang.Value1),
				new SqlParameter("@PanchangDate", dailyPanchang.PanchangDate == DateTime.MinValue ? SqlDateTime.Null : dailyPanchang.PanchangDate ),
				new SqlParameter("@Language", dailyPanchang.Language),
				new SqlParameter("@Location", dailyPanchang.Location),
				new SqlParameter("@DateAdded", dailyPanchang.DateAdded == DateTime.MinValue ? SqlDateTime.Null : dailyPanchang.DateAdded )
			};

			dailyPanchang.DailyPanchangID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "DailyPanchangInsert", parameters));
			return Ok(new {DailyPanchangID=dailyPanchang.DailyPanchangID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the DailyPanchang table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("DailyPanchangUpdate")]
		public  IActionResult DailyPanchangUpdate([FromBody] DailyPanchang dailyPanchang)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@DailyPanchangID", dailyPanchang.DailyPanchangID == 0 ? SqlInt32.Null : dailyPanchang.DailyPanchangID ),
				new SqlParameter("@SectionHeading", dailyPanchang.SectionHeading),
				new SqlParameter("@Key1", dailyPanchang.Key1),
				new SqlParameter("@Value1", dailyPanchang.Value1),
				new SqlParameter("@PanchangDate", dailyPanchang.PanchangDate == DateTime.MinValue ? SqlDateTime.Null : dailyPanchang.PanchangDate ),
				new SqlParameter("@Language", dailyPanchang.Language),
				new SqlParameter("@Location", dailyPanchang.Location),
				new SqlParameter("@DateAdded", dailyPanchang.DateAdded == DateTime.MinValue ? SqlDateTime.Null : dailyPanchang.DateAdded )
			};

			 var DailyPanchangID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "DailyPanchangUpdate", parameters));
			return Ok(new {DailyPanchangID =DailyPanchangID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the DailyPanchang table by its primary key.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("DailyPanchangDelete")]
		public  IActionResult DailyPanchangDelete(int dailyPanchangID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@DailyPanchangID", dailyPanchangID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var dailyPanchangDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "DailyPanchangDelete", parameters));
			return Ok(new {DailyPanchangID =dailyPanchangDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the DailyPanchang table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("DailyPanchangSelect")]
		public IActionResult DailyPanchangSelect(int dailyPanchangID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@DailyPanchangID", dailyPanchangID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "DailyPanchangSelect", parameters))
			{
				List<DailyPanchang> DailyPanchangList = new List<DailyPanchang>();
				while (dataReader.Read())
				{
					DailyPanchang DailyPanchang = MakeDailyPanchang(dataReader);
					DailyPanchangList.Add(DailyPanchang);
				}

				return  Ok(new {DailyPanchangList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the DailyPanchang table.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("DailyPanchangSelectAll")]
		public IActionResult DailyPanchangSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "DailyPanchangSelectAll", parameters))
			{
				List<DailyPanchang> DailyPanchangList = new List<DailyPanchang>();
				while (dataReader.Read())
				{
					DailyPanchang DailyPanchang = MakeDailyPanchang(dataReader);
					DailyPanchangList.Add(DailyPanchang);
				}

				return  Ok(new {DailyPanchangList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the DailyPanchang table by a ak=ll query.
		/// </summary>
	[HttpPost]
        [EnableCors("AllowAll")]
        [Route("DailyPanchangSelectByQuery")]
		public  IActionResult DailyPanchangSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "DailyPanchangSelectByQuery", parameters))
			{
				List<DailyPanchang> DailyPanchangList = new List<DailyPanchang>();
				while (dataReader.Read())
				{
					DailyPanchang DailyPanchang = MakeDailyPanchang(dataReader);
					DailyPanchangList.Add(DailyPanchang);
				}

				return  Ok(new { DailyPanchangList });
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the DailyPanchang class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  DailyPanchang MakeDailyPanchang(SqlDataReader dataReader)
		{
			DailyPanchang dailyPanchang = new DailyPanchang();
			dailyPanchang.DailyPanchangID = DataAccess.GetInt32(dataReader, "DailyPanchangID", 0);
			dailyPanchang.SectionHeading = DataAccess.GetString(dataReader, "SectionHeading", String.Empty);
			dailyPanchang.Key1 = DataAccess.GetString(dataReader, "Key1", String.Empty);
			dailyPanchang.Value1 = DataAccess.GetString(dataReader, "Value1", String.Empty);
			dailyPanchang.PanchangDate = DataAccess.GetDateTime(dataReader, "PanchangDate", DateTime.MinValue);
			dailyPanchang.Language = DataAccess.GetString(dataReader, "Language", String.Empty);
			dailyPanchang.Location = DataAccess.GetString(dataReader, "Location", String.Empty);
			dailyPanchang.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);

			return dailyPanchang;
		}

	}
	}
