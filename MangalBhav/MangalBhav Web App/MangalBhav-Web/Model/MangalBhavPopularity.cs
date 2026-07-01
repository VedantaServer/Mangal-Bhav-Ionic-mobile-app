using System;
namespace FaceUPAI.Models
{
	public class MangalBhavPopularity
	{
		#region Fields

		private int mangalBhavPopularityID;
		private int tenantID;
		private int userID;
		private bool isEKYC;
		private bool isPremium;
		private bool isRecommended;
		private bool isMBVerified;
		private string verifiedName;
		private string verifiedAddress;
		private string verifiedDOB;
		private string verifiedGender;
		private string remarks;
		private string descriptions;
		private DateTime dateAdded;
		private DateTime dateModified;
		private string updatedByUser;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the MangalBhavPopularity class.
		/// </summary>
		public MangalBhavPopularity()
		{
		}

		/// <summary>
		/// Initializes a new instance of the MangalBhavPopularity class.
		/// </summary>
		public MangalBhavPopularity(int tenantID, int userID, bool isEKYC, bool isPremium, bool isRecommended, bool isMBVerified, string verifiedName, string verifiedAddress, string verifiedDOB, string verifiedGender, string remarks, string descriptions, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.tenantID = tenantID;
			this.userID = userID;
			this.isEKYC = isEKYC;
			this.isPremium = isPremium;
			this.isRecommended = isRecommended;
			this.isMBVerified = isMBVerified;
			this.verifiedName = verifiedName;
			this.verifiedAddress = verifiedAddress;
			this.verifiedDOB = verifiedDOB;
			this.verifiedGender = verifiedGender;
			this.remarks = remarks;
			this.descriptions = descriptions;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		/// <summary>
		/// Initializes a new instance of the MangalBhavPopularity class.
		/// </summary>
		public MangalBhavPopularity(int mangalBhavPopularityID, int tenantID, int userID, bool isEKYC, bool isPremium, bool isRecommended, bool isMBVerified, string verifiedName, string verifiedAddress, string verifiedDOB, string verifiedGender, string remarks, string descriptions, DateTime dateAdded, DateTime dateModified, string updatedByUser)
		{
			this.mangalBhavPopularityID = mangalBhavPopularityID;
			this.tenantID = tenantID;
			this.userID = userID;
			this.isEKYC = isEKYC;
			this.isPremium = isPremium;
			this.isRecommended = isRecommended;
			this.isMBVerified = isMBVerified;
			this.verifiedName = verifiedName;
			this.verifiedAddress = verifiedAddress;
			this.verifiedDOB = verifiedDOB;
			this.verifiedGender = verifiedGender;
			this.remarks = remarks;
			this.descriptions = descriptions;
			this.dateAdded = dateAdded;
			this.dateModified = dateModified;
			this.updatedByUser = updatedByUser;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the MangalBhavPopularityID value.
		/// </summary>
		public  int MangalBhavPopularityID
		{
			get { return mangalBhavPopularityID; }
			set { mangalBhavPopularityID = value; }
		}

		/// <summary>
		/// Gets or sets the TenantID value.
		/// </summary>
		public  int TenantID
		{
			get { return tenantID; }
			set { tenantID = value; }
		}

		/// <summary>
		/// Gets or sets the UserID value.
		/// </summary>
		public  int UserID
		{
			get { return userID; }
			set { userID = value; }
		}

		/// <summary>
		/// Gets or sets the IsEKYC value.
		/// </summary>
		public  bool IsEKYC
		{
			get { return isEKYC; }
			set { isEKYC = value; }
		}

		/// <summary>
		/// Gets or sets the IsPremium value.
		/// </summary>
		public  bool IsPremium
		{
			get { return isPremium; }
			set { isPremium = value; }
		}

		/// <summary>
		/// Gets or sets the IsRecommended value.
		/// </summary>
		public  bool IsRecommended
		{
			get { return isRecommended; }
			set { isRecommended = value; }
		}

		/// <summary>
		/// Gets or sets the IsMBVerified value.
		/// </summary>
		public  bool IsMBVerified
		{
			get { return isMBVerified; }
			set { isMBVerified = value; }
		}

		/// <summary>
		/// Gets or sets the VerifiedName value.
		/// </summary>
		public  string VerifiedName
		{
			get { return verifiedName; }
			set { verifiedName = value; }
		}

		/// <summary>
		/// Gets or sets the VerifiedAddress value.
		/// </summary>
		public  string VerifiedAddress
		{
			get { return verifiedAddress; }
			set { verifiedAddress = value; }
		}

		/// <summary>
		/// Gets or sets the VerifiedDOB value.
		/// </summary>
		public  string VerifiedDOB
		{
			get { return verifiedDOB; }
			set { verifiedDOB = value; }
		}

		/// <summary>
		/// Gets or sets the VerifiedGender value.
		/// </summary>
		public  string VerifiedGender
		{
			get { return verifiedGender; }
			set { verifiedGender = value; }
		}

		/// <summary>
		/// Gets or sets the Remarks value.
		/// </summary>
		public  string Remarks
		{
			get { return remarks; }
			set { remarks = value; }
		}

		/// <summary>
		/// Gets or sets the Descriptions value.
		/// </summary>
		public  string Descriptions
		{
			get { return descriptions; }
			set { descriptions = value; }
		}

		/// <summary>
		/// Gets or sets the DateAdded value.
		/// </summary>
		public  DateTime DateAdded
		{
			get { return dateAdded; }
			set { dateAdded = value; }
		}

		/// <summary>
		/// Gets or sets the DateModified value.
		/// </summary>
		public  DateTime DateModified
		{
			get { return dateModified; }
			set { dateModified = value; }
		}

		/// <summary>
		/// Gets or sets the UpdatedByUser value.
		/// </summary>
		public  string UpdatedByUser
		{
			get { return updatedByUser; }
			set { updatedByUser = value; }
		}

		#endregion
	}
}
