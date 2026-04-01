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
	public class MasterDataAPI : ControllerBase
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
		/// Saves a record to the MasterData table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MasterDataInsert")]
		public  IActionResult MasterDataInsert([FromBody] MasterData masterData)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", masterData.TenantID == 0 ? SqlInt32.Null : masterData.TenantID ),
				new SqlParameter("@ParentItemID", masterData.ParentItemID == 0 ? SqlInt32.Null : masterData.ParentItemID ),
				new SqlParameter("@Description", masterData.Description),
				new SqlParameter("@Domain", masterData.Domain),
				new SqlParameter("@Identifier", masterData.Identifier),
				new SqlParameter("@DateAdded", masterData.DateAdded == DateTime.MinValue ? SqlDateTime.Null : masterData.DateAdded ),
				new SqlParameter("@DateModified", masterData.DateModified == DateTime.MinValue ? SqlDateTime.Null : masterData.DateModified ),
				new SqlParameter("@UpdatedByUser", masterData.UpdatedByUser),
				new SqlParameter("@MasterDataLevel", masterData.MasterDataLevel)
			};

			masterData.MasterDataID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MasterDataInsert", parameters));
			return Ok(new {MasterDataID=masterData.MasterDataID});
			}, this);
		}

		/// <summary>
		/// Selects all records from the MasterData table by a foreign key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MasterDataSelectAllByTenantID")]
		public  IActionResult MasterDataSelectAllByTenantID(int tenantID)
	{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MasterDataSelectAllByTenantID", parameters))
			{
				List<MasterData> MasterDataList = new List<MasterData>();
				while (dataReader.Read())
				{
					MasterData MasterData = MakeMasterData(dataReader);
					MasterDataList.Add(MasterData);
				}

				return  Ok(new {MasterDataList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the MasterData table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MasterDataSelectByQuery")]
		public  IActionResult MasterDataSelectByQuery(int tenantID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),							new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MasterDataSelectByQuery", parameters))
			{
				List<MasterData> MasterDataList = new List<MasterData>();
				while (dataReader.Read())
				{
					MasterData MasterData = MakeMasterData(dataReader);
					MasterDataList.Add(MasterData);
				}

				return  Ok(new {MasterDataList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the MasterData class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  MasterData MakeMasterData(SqlDataReader dataReader)
		{
			MasterData masterData = new MasterData();
			masterData.MasterDataID = DataAccess.GetInt32(dataReader, "MasterDataID", 0);
			masterData.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			masterData.ParentItemID = DataAccess.GetInt32(dataReader, "ParentItemID", 0);
			masterData.Description = DataAccess.GetString(dataReader, "Description", String.Empty);
			masterData.Domain = DataAccess.GetString(dataReader, "Domain", String.Empty);
			masterData.Identifier = DataAccess.GetString(dataReader, "Identifier", String.Empty);
			masterData.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			masterData.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			masterData.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);
			masterData.MasterDataLevel = DataAccess.GetString(dataReader, "MasterDataLevel", String.Empty);

			return masterData;
		}

	}
	}
