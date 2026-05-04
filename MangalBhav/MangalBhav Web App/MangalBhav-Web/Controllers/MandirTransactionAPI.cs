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
	public class MandirTransactionAPI : ControllerBase
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
		/// Saves a record to the MandirTransactions table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirTransactionsInsert")]
		public  IActionResult MandirTransactionsInsert([FromBody] MandirTransaction mandirTransaction)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", mandirTransaction.TenantID == 0 ? SqlInt32.Null : mandirTransaction.TenantID ),
				new SqlParameter("@MandirID", mandirTransaction.MandirID == 0 ? SqlInt32.Null : mandirTransaction.MandirID ),
				new SqlParameter("@UserID", mandirTransaction.UserID == 0 ? SqlInt32.Null : mandirTransaction.UserID ),
				new SqlParameter("@TransactionType", mandirTransaction.TransactionType),
				new SqlParameter("@ServiceName", mandirTransaction.ServiceName),
				new SqlParameter("@DonorName", mandirTransaction.DonorName),
				new SqlParameter("@Phone", mandirTransaction.Phone),
				new SqlParameter("@Amount", mandirTransaction.Amount),
				new SqlParameter("@PaymentMode", mandirTransaction.PaymentMode),
				new SqlParameter("@OrderID", mandirTransaction.OrderID),
				new SqlParameter("@UniqueReferenceNo", mandirTransaction.UniqueReferenceNo),
				new SqlParameter("@PaymentStatus", mandirTransaction.PaymentStatus),
				new SqlParameter("@PaymentGatewayResponse", mandirTransaction.PaymentGatewayResponse),
				new SqlParameter("@Remarks", mandirTransaction.Remarks),
				new SqlParameter("@DateAdded", mandirTransaction.DateAdded == DateTime.MinValue ? SqlDateTime.Null : mandirTransaction.DateAdded ),
				new SqlParameter("@DateModified", mandirTransaction.DateModified == DateTime.MinValue ? SqlDateTime.Null : mandirTransaction.DateModified ),
				new SqlParameter("@UpdatedByUser", mandirTransaction.UpdatedByUser)
			};

		mandirTransaction.TransactionID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MandirTransactionsInsert", parameters));
		return Ok(new { MandirTransactionID = mandirTransaction.TransactionID });
	}, this);

			
		}

		/// <summary>
		/// Updates a record in the MandirTransactions table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirTransactionsUpdate")]
		public  IActionResult MandirTransactionsUpdate([FromBody] MandirTransaction mandirTransaction)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TransactionID", mandirTransaction.TransactionID),
				new SqlParameter("@TenantID", mandirTransaction.TenantID == 0 ? SqlInt32.Null : mandirTransaction.TenantID ),
				new SqlParameter("@MandirID", mandirTransaction.MandirID == 0 ? SqlInt32.Null : mandirTransaction.MandirID ),
				new SqlParameter("@UserID", mandirTransaction.UserID == 0 ? SqlInt32.Null : mandirTransaction.UserID ),
				new SqlParameter("@TransactionType", mandirTransaction.TransactionType),
				new SqlParameter("@ServiceName", mandirTransaction.ServiceName),
				new SqlParameter("@DonorName", mandirTransaction.DonorName),
				new SqlParameter("@Phone", mandirTransaction.Phone),
				new SqlParameter("@Amount", mandirTransaction.Amount),
				new SqlParameter("@PaymentMode", mandirTransaction.PaymentMode),
				new SqlParameter("@OrderID", mandirTransaction.OrderID),
				new SqlParameter("@UniqueReferenceNo", mandirTransaction.UniqueReferenceNo),
				new SqlParameter("@PaymentStatus", mandirTransaction.PaymentStatus),
				new SqlParameter("@PaymentGatewayResponse", mandirTransaction.PaymentGatewayResponse),
				new SqlParameter("@Remarks", mandirTransaction.Remarks),
				new SqlParameter("@DateAdded", mandirTransaction.DateAdded == DateTime.MinValue ? SqlDateTime.Null : mandirTransaction.DateAdded ),
				new SqlParameter("@DateModified", mandirTransaction.DateModified == DateTime.MinValue ? SqlDateTime.Null : mandirTransaction.DateModified ),
				new SqlParameter("@UpdatedByUser", mandirTransaction.UpdatedByUser)
			};

			 var MandirTransactionID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "MandirTransactionsUpdate", parameters));
			return Ok(new {MandirTransactionID =MandirTransactionID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the MandirTransactions table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirTransactionsDelete")]
		public  IActionResult MandirTransactionsDelete(int transactionID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TransactionID", transactionID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var mandirTransactionsDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "MandirTransactionsDelete", parameters));
			return Ok(new {MandirTransactionsID =mandirTransactionsDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the MandirTransactions table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirTransactionSelect")]
		public IActionResult MandirTransactionSelect(long transactionID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TransactionID", transactionID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MandirTransactionsSelect", parameters))
			{
				List<MandirTransaction> MandirTransactionList = new List<MandirTransaction>();
				while (dataReader.Read())
				{
					MandirTransaction MandirTransaction = MakeMandirTransaction(dataReader);
					MandirTransactionList.Add(MandirTransaction);
				}

				return  Ok(new {MandirTransactionList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the MandirTransactions table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirTransactionSelectAll")]
		public IActionResult MandirTransactionSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "MandirTransactionsSelectAll", parameters))
			{
				List<MandirTransaction> MandirTransactionList = new List<MandirTransaction>();
				while (dataReader.Read())
				{
					MandirTransaction MandirTransaction = MakeMandirTransaction(dataReader);
					MandirTransactionList.Add(MandirTransaction);
				}

				return  Ok(new {MandirTransactionList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the MandirTransactions table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("MandirTransactionsSelectByQuery")]
		public  IActionResult MandirTransactionsSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "MandirTransactionsSelectByQuery", parameters))
			{
				List<MandirTransaction> MandirTransactionList = new List<MandirTransaction>();
				while (dataReader.Read())
				{
					MandirTransaction MandirTransaction = MakeMandirTransaction(dataReader);
					MandirTransactionList.Add(MandirTransaction);
				}

				return  Ok(new {MandirTransactionList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the MandirTransactions class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  MandirTransaction MakeMandirTransaction(SqlDataReader dataReader)
		{
			MandirTransaction mandirTransaction = new MandirTransaction();
			mandirTransaction.TransactionID = DataAccess.GetInt64(dataReader, "TransactionID", 0);
			mandirTransaction.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			mandirTransaction.MandirID = DataAccess.GetInt32(dataReader, "MandirID", 0);
			mandirTransaction.UserID = DataAccess.GetInt32(dataReader, "UserID", 0);
			mandirTransaction.TransactionType = DataAccess.GetString(dataReader, "TransactionType", String.Empty);
			mandirTransaction.ServiceName = DataAccess.GetString(dataReader, "ServiceName", String.Empty);
			mandirTransaction.DonorName = DataAccess.GetString(dataReader, "DonorName", String.Empty);
			mandirTransaction.Phone = DataAccess.GetString(dataReader, "Phone", String.Empty);
			mandirTransaction.Amount = DataAccess.GetString(dataReader, "Amount", String.Empty);
			mandirTransaction.PaymentMode = DataAccess.GetString(dataReader, "PaymentMode", String.Empty);
			mandirTransaction.OrderID = DataAccess.GetString(dataReader, "OrderID", String.Empty);
			mandirTransaction.UniqueReferenceNo = DataAccess.GetString(dataReader, "UniqueReferenceNo", String.Empty);
			mandirTransaction.PaymentStatus = DataAccess.GetString(dataReader, "PaymentStatus", String.Empty);
			mandirTransaction.PaymentGatewayResponse = DataAccess.GetString(dataReader, "PaymentGatewayResponse", String.Empty);
			mandirTransaction.Remarks = DataAccess.GetString(dataReader, "Remarks", String.Empty);
			mandirTransaction.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			mandirTransaction.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			mandirTransaction.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return mandirTransaction;
		}

	}
	}
