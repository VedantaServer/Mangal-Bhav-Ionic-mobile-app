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
	public class MandirAPI : ControllerBase
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
		/// Saves a record to the Mandir table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirInsert")]
		public  IActionResult MandirInsert([FromBody] Mandir mandir)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", mandir.TenantID == 0 ? SqlInt32.Null : mandir.TenantID ),
				new SqlParameter("@MandirName", mandir.MandirName),
				new SqlParameter("@GodName", mandir.GodName),
				new SqlParameter("@FrontImage", mandir.FrontImage),
				new SqlParameter("@InsideImage", mandir.InsideImage),
				new SqlParameter("@PujariName", mandir.PujariName),
				new SqlParameter("@PujariPhoneNumber", mandir.PujariPhoneNumber),
				new SqlParameter("@History", mandir.History),
				new SqlParameter("@Address", mandir.Address),
				new SqlParameter("@City", mandir.City),
				new SqlParameter("@State", mandir.State),
				new SqlParameter("@Pincode", mandir.Pincode),
				new SqlParameter("@Latitude", mandir.Latitude),
				new SqlParameter("@Longitude", mandir.Longitude),
				new SqlParameter("@IsVerified", mandir.IsVerified),
				new SqlParameter("@VerificationStatus", mandir.VerificationStatus),
				new SqlParameter("@AddedByUserID", mandir.AddedByUserID == 0 ? SqlInt32.Null : mandir.AddedByUserID ),
				new SqlParameter("@AddedByName", mandir.AddedByName),
				new SqlParameter("@DateAdded", mandir.DateAdded == DateTime.MinValue ? SqlDateTime.Null : mandir.DateAdded ),
				new SqlParameter("@DateModified", mandir.DateModified == DateTime.MinValue ? SqlDateTime.Null : mandir.DateModified ),
				new SqlParameter("@IsActive", mandir.IsActive)
			};

			mandir.MandirID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MandirInsert", parameters));
			return Ok(new {MandirID=mandir.MandirID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the Mandir table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirUpdate")]
		public  IActionResult MandirUpdate([FromBody] Mandir mandir)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", mandir.TenantID == 0 ? SqlInt32.Null : mandir.TenantID ),
				new SqlParameter("@MandirID", mandir.MandirID == 0 ? SqlInt32.Null : mandir.MandirID ),
				new SqlParameter("@MandirName", mandir.MandirName),
				new SqlParameter("@GodName", mandir.GodName),
				new SqlParameter("@FrontImage", mandir.FrontImage),
				new SqlParameter("@InsideImage", mandir.InsideImage),
				new SqlParameter("@PujariName", mandir.PujariName),
				new SqlParameter("@PujariPhoneNumber", mandir.PujariPhoneNumber),
				new SqlParameter("@History", mandir.History),
				new SqlParameter("@Address", mandir.Address),
				new SqlParameter("@City", mandir.City),
				new SqlParameter("@State", mandir.State),
				new SqlParameter("@Pincode", mandir.Pincode),
				new SqlParameter("@Latitude", mandir.Latitude),
				new SqlParameter("@Longitude", mandir.Longitude),
				new SqlParameter("@IsVerified", mandir.IsVerified),
				new SqlParameter("@VerificationStatus", mandir.VerificationStatus),
				new SqlParameter("@AddedByUserID", mandir.AddedByUserID == 0 ? SqlInt32.Null : mandir.AddedByUserID ),
				new SqlParameter("@AddedByName", mandir.AddedByName),
				new SqlParameter("@DateAdded", mandir.DateAdded == DateTime.MinValue ? SqlDateTime.Null : mandir.DateAdded ),
				new SqlParameter("@DateModified", mandir.DateModified == DateTime.MinValue ? SqlDateTime.Null : mandir.DateModified ),
				new SqlParameter("@IsActive", mandir.IsActive)
			};

			 var MandirID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "MandirUpdate", parameters));
			return Ok(new {MandirID =MandirID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the Mandir table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirDelete")]
		public  IActionResult MandirDelete(int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

						};

			 var mandirDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MandirDelete", parameters));
			return Ok(new {MandirID =mandirDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Mandir table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirSelect")]
		public IActionResult MandirSelect(int mandirID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MandirSelect", parameters))
			{
				List<Mandir> MandirList = new List<Mandir>();
				while (dataReader.Read())
				{
					Mandir Mandir = MakeMandir(dataReader);
					MandirList.Add(Mandir);
				}

				return  Ok(new {MandirList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Mandir table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirSelectAll")]
		public IActionResult MandirSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MandirSelectAll", parameters))
			{
				List<Mandir> MandirList = new List<Mandir>();
				while (dataReader.Read())
				{
					Mandir Mandir = MakeMandir(dataReader);
					MandirList.Add(Mandir);
				}

				return  Ok(new {MandirList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all records from the Mandir table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirSelectAllByTenantID")]
		public  IActionResult MandirSelectAllByTenantID(int tenantID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MandirSelectAllByTenantID", parameters))
			{
				List<Mandir> MandirList = new List<Mandir>();
				while (dataReader.Read())
				{
					Mandir Mandir = MakeMandir(dataReader);
					MandirList.Add(Mandir);
				}

				return  Ok(new {MandirList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the Mandir table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirSelectByQuery")]
		public  IActionResult MandirSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MandirSelectByQuery", parameters))
			{
				List<Mandir> MandirList = new List<Mandir>();
				while (dataReader.Read())
				{
					Mandir Mandir = MakeMandir(dataReader);
					MandirList.Add(Mandir);
				}

				return  Ok(new {MandirList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the Mandir class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  Mandir MakeMandir(SqlDataReader dataReader)
		{
			Mandir mandir = new Mandir();
			mandir.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			mandir.MandirID = DataAccess.GetInt32(dataReader, "MandirID", 0);
			mandir.MandirName = DataAccess.GetString(dataReader, "MandirName", String.Empty);
			mandir.GodName = DataAccess.GetString(dataReader, "GodName", String.Empty);
			mandir.FrontImage = DataAccess.GetString(dataReader, "FrontImage", String.Empty);
			mandir.InsideImage = DataAccess.GetString(dataReader, "InsideImage", String.Empty);
			mandir.PujariName = DataAccess.GetString(dataReader, "PujariName", String.Empty);
			mandir.PujariPhoneNumber = DataAccess.GetString(dataReader, "PujariPhoneNumber", String.Empty);
			mandir.History = DataAccess.GetString(dataReader, "History", String.Empty);
			mandir.Address = DataAccess.GetString(dataReader, "Address", String.Empty);
			mandir.City = DataAccess.GetString(dataReader, "City", String.Empty);
			mandir.State = DataAccess.GetString(dataReader, "State", String.Empty);
			mandir.Pincode = DataAccess.GetString(dataReader, "Pincode", String.Empty);
			mandir.Latitude = DataAccess.GetDecimal(dataReader, "Latitude", Decimal.Zero);
			mandir.Longitude = DataAccess.GetDecimal(dataReader, "Longitude", Decimal.Zero);
			mandir.IsVerified = DataAccess.GetBoolean(dataReader, "IsVerified", false);
			mandir.VerificationStatus = DataAccess.GetString(dataReader, "VerificationStatus", String.Empty);
			mandir.AddedByUserID = DataAccess.GetInt32(dataReader, "AddedByUserID", 0);
			mandir.AddedByName = DataAccess.GetString(dataReader, "AddedByName", String.Empty);
			mandir.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			mandir.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			mandir.IsActive = DataAccess.GetBoolean(dataReader, "IsActive", false);

			return mandir;
		}

	}
	}
