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
	public class MandirLedgerAPI : ControllerBase
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
		/// Saves a record to the MandirLedger table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("MandirLedgerInsert")]
		public  IActionResult MandirLedgerInsert([FromBody] MandirLedger mandirLedger)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", mandirLedger.TenantID == 0 ? SqlInt32.Null : mandirLedger.TenantID ),
				new SqlParameter("@MandirID", mandirLedger.MandirID == 0 ? SqlInt32.Null : mandirLedger.MandirID ),
				new SqlParameter("@TransactionID", mandirLedger.TransactionID),
				new SqlParameter("@EntryType", mandirLedger.EntryType),
				new SqlParameter("@SourceType", mandirLedger.SourceType),
				new SqlParameter("@Amount", mandirLedger.Amount),
				new SqlParameter("@BankAccountID", mandirLedger.BankAccountID == 0 ? SqlInt32.Null : mandirLedger.BankAccountID ),
				new SqlParameter("@PaymentReferenceNo", mandirLedger.PaymentReferenceNo),
				new SqlParameter("@Remarks", mandirLedger.Remarks),
				new SqlParameter("@IsPaid", mandirLedger.IsPaid),
				new SqlParameter("@IsCancelled", mandirLedger.IsCancelled),
				new SqlParameter("@DateAdded", mandirLedger.DateAdded == DateTime.MinValue ? SqlDateTime.Null : mandirLedger.DateAdded ),
				new SqlParameter("@DateModified", mandirLedger.DateModified == DateTime.MinValue ? SqlDateTime.Null : mandirLedger.DateModified ),
				new SqlParameter("@UpdatedByUser", mandirLedger.UpdatedByUser)
			};


            var MandirLedgerID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "MandirLedgerInsert", parameters));
            return Ok(new { MandirLedgerID = MandirLedgerID });
        }, this);
		}

		/// <summary>
		/// Updates a record in the MandirLedger table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("MandirLedgerUpdate")]
		public  IActionResult MandirLedgerUpdate([FromBody] MandirLedger mandirLedger)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirLedgerID", mandirLedger.MandirLedgerID),
				new SqlParameter("@TenantID", mandirLedger.TenantID == 0 ? SqlInt32.Null : mandirLedger.TenantID ),
				new SqlParameter("@MandirID", mandirLedger.MandirID == 0 ? SqlInt32.Null : mandirLedger.MandirID ),
				new SqlParameter("@TransactionID", mandirLedger.TransactionID),
				new SqlParameter("@EntryType", mandirLedger.EntryType),
				new SqlParameter("@SourceType", mandirLedger.SourceType),
				new SqlParameter("@Amount", mandirLedger.Amount),
				new SqlParameter("@BankAccountID", mandirLedger.BankAccountID == 0 ? SqlInt32.Null : mandirLedger.BankAccountID ),
				new SqlParameter("@PaymentReferenceNo", mandirLedger.PaymentReferenceNo),
				new SqlParameter("@Remarks", mandirLedger.Remarks),
				new SqlParameter("@IsPaid", mandirLedger.IsPaid),
				new SqlParameter("@IsCancelled", mandirLedger.IsCancelled),
				new SqlParameter("@DateAdded", mandirLedger.DateAdded == DateTime.MinValue ? SqlDateTime.Null : mandirLedger.DateAdded ),
				new SqlParameter("@DateModified", mandirLedger.DateModified == DateTime.MinValue ? SqlDateTime.Null : mandirLedger.DateModified ),
				new SqlParameter("@UpdatedByUser", mandirLedger.UpdatedByUser)
			};

			 var MandirLedgerID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "MandirLedgerUpdate", parameters));
			return Ok(new {MandirLedgerID =MandirLedgerID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the MandirLedger table by its primary key.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("MandirLedgerDelete")]
		public  IActionResult MandirLedgerDelete(int mandirLedgerID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirLedgerID", mandirLedgerID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var mandirLedgerDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MandirLedgerDelete", parameters));
			return Ok(new {MandirLedgerID =mandirLedgerDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the MandirLedger table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("MandirLedgerSelect")]
		public IActionResult MandirLedgerSelect(long mandirLedgerID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@MandirLedgerID", mandirLedgerID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MandirLedgerSelect", parameters))
			{
				List<MandirLedger> MandirLedgerList = new List<MandirLedger>();
				while (dataReader.Read())
				{
					MandirLedger MandirLedger = MakeMandirLedger(dataReader);
					MandirLedgerList.Add(MandirLedger);
				}

				return  Ok(new {MandirLedgerList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the MandirLedger table.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("MandirLedgerSelectAll")]
		public IActionResult MandirLedgerSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MandirLedgerSelectAll", parameters))
			{
				List<MandirLedger> MandirLedgerList = new List<MandirLedger>();
				while (dataReader.Read())
				{
					MandirLedger MandirLedger = MakeMandirLedger(dataReader);
					MandirLedgerList.Add(MandirLedger);
				}

				return  Ok(new {MandirLedgerList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the MandirLedger table by a ak=ll query.
		/// </summary>
	[HttpPost]
	[EnableCors("AllowAll")]
	[Route("MandirLedgerSelectByQuery")]
		public  IActionResult MandirLedgerSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MandirLedgerSelectByQuery", parameters))
			{
				List<MandirLedger> MandirLedgerList = new List<MandirLedger>();
				while (dataReader.Read())
				{
					MandirLedger MandirLedger = MakeMandirLedger(dataReader);
					MandirLedgerList.Add(MandirLedger);
				}

				return  Ok(new {MandirLedgerList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the MandirLedger class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  MandirLedger MakeMandirLedger(SqlDataReader dataReader)
		{
			MandirLedger mandirLedger = new MandirLedger();
			mandirLedger.MandirLedgerID = DataAccess.GetInt64(dataReader, "MandirLedgerID", 0);
			mandirLedger.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			mandirLedger.MandirID = DataAccess.GetInt32(dataReader, "MandirID", 0);
			mandirLedger.TransactionID = DataAccess.GetInt64(dataReader, "TransactionID", 0);
			mandirLedger.EntryType = DataAccess.GetString(dataReader, "EntryType", String.Empty);
			mandirLedger.SourceType = DataAccess.GetString(dataReader, "SourceType", String.Empty);
			mandirLedger.Amount = DataAccess.GetDecimal(dataReader, "Amount", Decimal.Zero);
			mandirLedger.BankAccountID = DataAccess.GetInt32(dataReader, "BankAccountID", 0);
			mandirLedger.PaymentReferenceNo = DataAccess.GetString(dataReader, "PaymentReferenceNo", String.Empty);
			mandirLedger.Remarks = DataAccess.GetString(dataReader, "Remarks", String.Empty);
			mandirLedger.IsPaid = DataAccess.GetBoolean(dataReader, "IsPaid", false);
			mandirLedger.IsCancelled = DataAccess.GetBoolean(dataReader, "IsCancelled", false);
			mandirLedger.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			mandirLedger.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			mandirLedger.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return mandirLedger;
		}

	}
	}
