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
	public class LocationAPI : ControllerBase
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
		/// Saves a record to the Locations table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("LocationsInsert")]
		public  IActionResult LocationsInsert([FromBody] Location location)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", location.TenantID == 0 ? SqlInt32.Null : location.TenantID ),
				new SqlParameter("@UserID", location.UserID == 0 ? SqlInt32.Null : location.UserID ),
				new SqlParameter("@Name", location.Name),
				new SqlParameter("@ContactPerson", location.ContactPerson),
				new SqlParameter("@ContactPhone", location.ContactPhone),
				new SqlParameter("@ContactEmail", location.ContactEmail),
				new SqlParameter("@AddressLine1", location.AddressLine1),
				new SqlParameter("@AddressLine2", location.AddressLine2),
				new SqlParameter("@City", location.City),
				new SqlParameter("@Pincode", location.Pincode),
				new SqlParameter("@State", location.State),
				new SqlParameter("@Country", location.Country),
				new SqlParameter("@Latitude", location.Latitude),
				new SqlParameter("@Longitude", location.Longitude),
				new SqlParameter("@IsActive", location.IsActive),
				new SqlParameter("@DateAdded", location.DateAdded == DateTime.MinValue ? SqlDateTime.Null : location.DateAdded ),
				new SqlParameter("@DateModified", location.DateModified == DateTime.MinValue ? SqlDateTime.Null : location.DateModified ),
				new SqlParameter("@UpdatedByUser", location.UpdatedByUser)
			};

			location.LocationID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "LocationsInsert", parameters));
			return Ok(new {LocationID=location.LocationID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the Locations table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("LocationsUpdate")]
		public  IActionResult LocationsUpdate([FromBody] Location location)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@LocationID", location.LocationID == 0 ? SqlInt32.Null : location.LocationID ),
				new SqlParameter("@TenantID", location.TenantID == 0 ? SqlInt32.Null : location.TenantID ),
				new SqlParameter("@UserID", location.UserID == 0 ? SqlInt32.Null : location.UserID ),
				new SqlParameter("@Name", location.Name),
				new SqlParameter("@ContactPerson", location.ContactPerson),
				new SqlParameter("@ContactPhone", location.ContactPhone),
				new SqlParameter("@ContactEmail", location.ContactEmail),
				new SqlParameter("@AddressLine1", location.AddressLine1),
				new SqlParameter("@AddressLine2", location.AddressLine2),
				new SqlParameter("@City", location.City),
				new SqlParameter("@Pincode", location.Pincode),
				new SqlParameter("@State", location.State),
				new SqlParameter("@Country", location.Country),
				new SqlParameter("@Latitude", location.Latitude),
				new SqlParameter("@Longitude", location.Longitude),
				new SqlParameter("@IsActive", location.IsActive),
				new SqlParameter("@DateAdded", location.DateAdded == DateTime.MinValue ? SqlDateTime.Null : location.DateAdded ),
				new SqlParameter("@DateModified", location.DateModified == DateTime.MinValue ? SqlDateTime.Null : location.DateModified ),
				new SqlParameter("@UpdatedByUser", location.UpdatedByUser)
			};

			 var LocationID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "LocationsUpdate", parameters));
			return Ok(new {LocationID =LocationID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the Locations table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("LocationsDelete")]
		public  IActionResult LocationsDelete(int locationID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@LocationID", locationID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var locationsDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "LocationsDelete", parameters));
			return Ok(new {LocationsID =locationsDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Locations table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("LocationSelect")]
		public IActionResult LocationSelect(int locationID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@LocationID", locationID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "LocationsSelect", parameters))
			{
				List<Location> LocationList = new List<Location>();
				while (dataReader.Read())
				{
					Location Location = MakeLocation(dataReader);
					LocationList.Add(Location);
				}

				return  Ok(new {LocationList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Locations table.
		/// </summary>
	    [HttpPost]
		[EnableCors("AllowAll")]
		[Route("LocationSelectAll")]
		public IActionResult LocationSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "LocationsSelectAll", parameters))
			{
				List<Location> LocationList = new List<Location>();
				while (dataReader.Read())
				{
					Location Location = MakeLocation(dataReader);
					LocationList.Add(Location);
				}

				return  Ok(new {LocationList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the Locations table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("LocationsSelectAllByTenantID")]
		public  IActionResult LocationsSelectAllByTenantID(int tenantID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "LocationsSelectAllByTenantID", parameters))
			{
				List<Location> LocationList = new List<Location>();
				while (dataReader.Read())
				{
					Location Location = MakeLocation(dataReader);
					LocationList.Add(Location);
				}

				return  Ok(new {LocationList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the Locations table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("LocationsNUSelectByQuery")]
		public  IActionResult LocationsSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "LocationsSelectByQuery", parameters))
			{
				List<Location> LocationList = new List<Location>();
				while (dataReader.Read())
				{
					Location Location = MakeLocation(dataReader);
					LocationList.Add(Location);
				}

				return  Ok(new {LocationList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the Locations class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  Location MakeLocation(SqlDataReader dataReader)
		{
			Location location = new Location();
			location.LocationID = DataAccess.GetInt32(dataReader, "LocationID", 0);
			location.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			location.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			location.Name = DataAccess.GetString(dataReader, "Name", String.Empty);
			location.ContactPerson = DataAccess.GetString(dataReader, "ContactPerson", String.Empty);
			location.ContactPhone = DataAccess.GetString(dataReader, "ContactPhone", String.Empty);
			location.ContactEmail = DataAccess.GetString(dataReader, "ContactEmail", String.Empty);
			location.AddressLine1 = DataAccess.GetString(dataReader, "AddressLine1", String.Empty);
			location.AddressLine2 = DataAccess.GetString(dataReader, "AddressLine2", String.Empty);
			location.City = DataAccess.GetString(dataReader, "City", String.Empty);
			location.Pincode = DataAccess.GetString(dataReader, "Pincode", String.Empty);
			location.State = DataAccess.GetString(dataReader, "State", String.Empty);
			location.Country = DataAccess.GetString(dataReader, "Country", String.Empty);
			location.Latitude = DataAccess.GetDecimal(dataReader, "Latitude", Decimal.Zero);
			location.Longitude = DataAccess.GetDecimal(dataReader, "Longitude", Decimal.Zero);
			location.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);
			location.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			location.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			location.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return location;
		}

	}
	}
