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
	public class DocumentAPI : ControllerBase
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
		/// Saves a record to the Document table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("DocumentInsert")]
		public  IActionResult DocumentInsert([FromBody] Document document)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", document.TenantID == 0 ? SqlInt32.Null : document.TenantID ),
				new SqlParameter("@DocumentType", document.DocumentType),
				new SqlParameter("@EntityType", document.EntityType),
				new SqlParameter("@EntityRefKey", document.EntityRefKey == 0 ? SqlInt32.Null : document.EntityRefKey ),
				new SqlParameter("@Description", document.Description),
				new SqlParameter("@FileName", document.FileName),
				new SqlParameter("@DateAdded", document.DateAdded == DateTime.MinValue ? SqlDateTime.Null : document.DateAdded ),
				new SqlParameter("@DateModified", document.DateModified == DateTime.MinValue ? SqlDateTime.Null : document.DateModified ),
				new SqlParameter("@UpdatedByUser", document.UpdatedByUser)
			};

			document.DocumentID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "DocumentInsert", parameters));
			return Ok(new {DocumentID=document.DocumentID});
			}, this);
		}

		/// <summary>
		/// Updates a record in the Document table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("DocumentUpdate")]
		public  IActionResult DocumentUpdate([FromBody] Document document)
		{
			return ApiHandler.Handle(() =>
	{

			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@DocumentID", document.DocumentID == 0 ? SqlInt32.Null : document.DocumentID ),
				new SqlParameter("@TenantID", document.TenantID == 0 ? SqlInt32.Null : document.TenantID ),
				new SqlParameter("@DocumentType", document.DocumentType),
				new SqlParameter("@EntityType", document.EntityType),
				new SqlParameter("@EntityRefKey", document.EntityRefKey == 0 ? SqlInt32.Null : document.EntityRefKey ),
				new SqlParameter("@Description", document.Description),
				new SqlParameter("@FileName", document.FileName),
				new SqlParameter("@DateAdded", document.DateAdded == DateTime.MinValue ? SqlDateTime.Null : document.DateAdded ),
				new SqlParameter("@DateModified", document.DateModified == DateTime.MinValue ? SqlDateTime.Null : document.DateModified ),
				new SqlParameter("@UpdatedByUser", document.UpdatedByUser)
			};

			 var DocumentID = Convert.ToInt32(DataAccess.ExecuteNonQuery(CommandType.StoredProcedure, "DocumentUpdate", parameters));
			return Ok(new {DocumentID =DocumentID});
			}, this);
		}

		/// <summary>
		/// Deletes a record from the Document table by its primary key.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("DocumentDelete")]
		public  IActionResult DocumentDelete(int documentID, int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@DocumentID", documentID)

				,new SqlParameter("@TenantID", tenantID)			};

			 var documentDeletedID = Convert.ToInt32(DataAccess.ExecuteScalar(CommandType.StoredProcedure, "DocumentDelete", parameters));
			return Ok(new {DocumentID =documentDeletedID});
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Document table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("DocumentSelect")]
		public IActionResult DocumentSelect(int documentID,int tenantID)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@DocumentID", documentID)
,				new SqlParameter("@TenantID", tenantID)
			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "DocumentSelect", parameters))
			{
				List<Document> DocumentList = new List<Document>();
				while (dataReader.Read())
				{
					Document Document = MakeDocument(dataReader);
					DocumentList.Add(Document);
				}

				return  Ok(new {DocumentList});
			}
			}, this);
		}

		/// <summary>
		/// Selects a single record from the Document table.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("DocumentSelectAll")]
		public IActionResult DocumentSelectAll(int tenantID){
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID)
			};
			using (SqlDataReader dataReader = DataAccess.ExecuteReader(CommandType.StoredProcedure, "DocumentSelectAll", parameters))
			{
				List<Document> DocumentList = new List<Document>();
				while (dataReader.Read())
				{
					Document Document = MakeDocument(dataReader);
					DocumentList.Add(Document);
				}

				return  Ok(new {DocumentList});
			}
			}, this);
		}

		/// <summary>
		/// Selects all query records from the Document table by a ak=ll query.
		/// </summary>
	[HttpPost]
		[EnableCors("AllowAll")]
		[Route("DocumentSelectByQuery")]
		public  IActionResult DocumentSelectByQuery(int tenantID,int schoolID,string Query)
		{
			return ApiHandler.Handle(() =>
	{
			SqlParameter[] parameters = new SqlParameter[]
			{
				new SqlParameter("@TenantID", tenantID),				new SqlParameter("@SchoolID", schoolID),				new SqlParameter("@Query", Query),

			};

			using (SqlDataReader dataReader = DataAccess.ExecuteReader( System.Data.CommandType.StoredProcedure, "DocumentSelectByQuery", parameters))
			{
				List<Document> DocumentList = new List<Document>();
				while (dataReader.Read())
				{
					Document Document = MakeDocument(dataReader);
					DocumentList.Add(Document);
				}

				return  Ok(new {DocumentList});
			}
			}, this);
		}

		/// <summary>
		/// Creates a new instance of the Document class and populates it with data from the specified SqlDataReader.
		/// </summary>
		public  Document MakeDocument(SqlDataReader dataReader)
		{
			Document document = new Document();
			document.DocumentID = DataAccess.GetInt32(dataReader, "DocumentID", 0);
			document.TenantID = DataAccess.GetInt32(dataReader, "TenantID", 0);
			document.DocumentType = DataAccess.GetString(dataReader, "DocumentType", String.Empty);
			document.EntityType = DataAccess.GetString(dataReader, "EntityType", String.Empty);
			document.EntityRefKey = DataAccess.GetInt32(dataReader, "EntityRefKey", 0);
			document.Description = DataAccess.GetString(dataReader, "Description", String.Empty);
			document.FileName = DataAccess.GetString(dataReader, "FileName", String.Empty);
			document.DateAdded = DataAccess.GetDateTime(dataReader, "DateAdded", DateTime.MinValue);
			document.DateModified = DataAccess.GetDateTime(dataReader, "DateModified", DateTime.MinValue);
			document.UpdatedByUser = DataAccess.GetString(dataReader, "UpdatedByUser", String.Empty);

			return document;
		}

	}
	}
