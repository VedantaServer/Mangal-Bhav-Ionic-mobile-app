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
	public class FestivalAPI : ControllerBase
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
		/// Saves a record to the Festivals table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("FestivalsInsert")]
		public  IActionResult FestivalsInsert([FromBody] Festival festival)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FestivalName", festival.FestivalName),
				new SqlParameter("@Description", festival.Description),
				new SqlParameter("@FestivalDate", festival.FestivalDate == DateTime.MinValue ? SqlDateTime.Null : festival.FestivalDate ),
				new SqlParameter("@Year", festival.Year == 0 ? SqlInt32.Null : festival.Year ),
				new SqlParameter("@CountryCode", festival.CountryCode),
				new SqlParameter("@CountryName", festival.CountryName),
				new SqlParameter("@Type", festival.Type),
				new SqlParameter("@PrimaryType", festival.PrimaryType),
				new SqlParameter("@Locations", festival.Locations),
				new SqlParameter("@States", festival.States),
				new SqlParameter("@CanonicalURL", festival.CanonicalURL),
				new SqlParameter("@UrlID", festival.UrlID),
				new SqlParameter("@DateAdded", festival.DateAdded == DateTime.MinValue ? SqlDateTime.Null : festival.DateAdded )
			};

			festival.FestivalID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FestivalsInsert", parameters));
			return Ok(new {FestivalID=festival.FestivalID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the Festivals table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("FestivalsUpdate")]
		public  IActionResult FestivalsUpdate([FromBody] Festival festival)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FestivalID", festival.FestivalID == 0 ? SqlInt32.Null : festival.FestivalID ),
				new SqlParameter("@FestivalName", festival.FestivalName),
				new SqlParameter("@Description", festival.Description),
				new SqlParameter("@FestivalDate", festival.FestivalDate == DateTime.MinValue ? SqlDateTime.Null : festival.FestivalDate ),
				new SqlParameter("@Year", festival.Year == 0 ? SqlInt32.Null : festival.Year ),
				new SqlParameter("@CountryCode", festival.CountryCode),
				new SqlParameter("@CountryName", festival.CountryName),
				new SqlParameter("@Type", festival.Type),
				new SqlParameter("@PrimaryType", festival.PrimaryType),
				new SqlParameter("@Locations", festival.Locations),
				new SqlParameter("@States", festival.States),
				new SqlParameter("@CanonicalURL", festival.CanonicalURL),
				new SqlParameter("@UrlID", festival.UrlID),
				new SqlParameter("@DateAdded", festival.DateAdded == DateTime.MinValue ? SqlDateTime.Null : festival.DateAdded )
			};

			 var FestivalID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "FestivalsUpdate", parameters));
			return Ok(new {FestivalID =FestivalID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the Festivals table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("FestivalsDelete")]
		public  IActionResult FestivalsDelete(int festivalID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FestivalID", festivalID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var festivalsDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "FestivalsDelete", parameters));
			return Ok(new {FestivalsID =festivalsDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Festivals table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("FestivalSelect")]
		public IActionResult FestivalSelect(int festivalID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@FestivalID", festivalID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FestivalsSelect", parameters))
			{
				List<Festival> FestivalList = new List<Festival>();
				while (dataReader.Read())
				{
					Festival Festival = MakeFestival(dataReader);
					FestivalList.Add(Festival);
				}

				return  Ok(new {FestivalList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Festivals table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("FestivalSelectAll")]
		public IActionResult FestivalSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "FestivalsSelectAll", parameters))
			{
				List<Festival> FestivalList = new List<Festival>();
				while (dataReader.Read())
				{
					Festival Festival = MakeFestival(dataReader);
					FestivalList.Add(Festival);
				}

				return  Ok(new {FestivalList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the Festivals table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("FestivalsSelectByQuery")]
		public  IActionResult FestivalsSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "FestivalsSelectByQuery", parameters))
			{
				List<Festival> FestivalList = new List<Festival>();
				while (dataReader.Read())
				{
					Festival Festival = MakeFestival(dataReader);
					FestivalList.Add(Festival);
				}

				return  Ok(new {FestivalList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the Festivals class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  Festival MakeFestival(SqlDataReader dataReader)
		{
			Festival festival = new Festival();
			festival.FestivalID = DataAccess.GetInt32(dataReader, "FestivalID", 0);
			festival.FestivalName = DataAccess.GetString(dataReader, "FestivalName", String.Empty);
			festival.Description = DataAccess.GetString(dataReader, "Description", String.Empty);
			festival.FestivalDate = DataAccess.GetDateTime(dataReader, "FestivalDate", DateTime.MinValue);
			festival.Year = DataAccess.GetInt32(dataReader, "Year", 0);
			festival.CountryCode = DataAccess.GetString(dataReader, "CountryCode", String.Empty);
			festival.CountryName = DataAccess.GetString(dataReader, "CountryName", String.Empty);
			festival.Type = DataAccess.GetString(dataReader, "Type", String.Empty);
			festival.PrimaryType = DataAccess.GetString(dataReader, "PrimaryType", String.Empty);
			festival.Locations = DataAccess.GetString(dataReader, "Locations", String.Empty);
			festival.States = DataAccess.GetString(dataReader, "States", String.Empty);
			festival.CanonicalURL = DataAccess.GetString(dataReader, "CanonicalURL", String.Empty);
			festival.UrlID = DataAccess.GetString(dataReader, "UrlID", String.Empty);
			festival.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);

			return festival;
		}

	}
	}
