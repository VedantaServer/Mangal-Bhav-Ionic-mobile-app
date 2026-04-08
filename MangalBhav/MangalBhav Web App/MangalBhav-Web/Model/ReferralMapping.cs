using System;
namespace FaceUPAI.Models
{
	public class ReferralMapping
	{
		#region Fields

		private int tenantID;
		private int referralMappingID;
		private int userReferralCodeID;
		private int referredUserID;
		private DateTime dateAdded;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the ReferralMapping class.
		/// </summary>
		public ReferralMapping()
		{
		}

		/// <summary>
		/// Initializes a new instance of the ReferralMapping class.
		/// </summary>
		public ReferralMapping(int tenantID, int userReferralCodeID, int referredUserID, DateTime dateAdded)
		{
			this.tenantID = tenantID;
			this.userReferralCodeID = userReferralCodeID;
			this.referredUserID = referredUserID;
			this.dateAdded = dateAdded;
		}

		/// <summary>
		/// Initializes a new instance of the ReferralMapping class.
		/// </summary>
		public ReferralMapping(int tenantID, int referralMappingID, int userReferralCodeID, int referredUserID, DateTime dateAdded)
		{
			this.tenantID = tenantID;
			this.referralMappingID = referralMappingID;
			this.userReferralCodeID = userReferralCodeID;
			this.referredUserID = referredUserID;
			this.dateAdded = dateAdded;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the TenantID value.
		/// </summary>
		public  int TenantID
		{
			get { return tenantID; }
			set { tenantID = value; }
		}

		/// <summary>
		/// Gets or sets the ReferralMappingID value.
		/// </summary>
		public  int ReferralMappingID
		{
			get { return referralMappingID; }
			set { referralMappingID = value; }
		}

		/// <summary>
		/// Gets or sets the UserReferralCodeID value.
		/// </summary>
		public  int UserReferralCodeID
		{
			get { return userReferralCodeID; }
			set { userReferralCodeID = value; }
		}

		/// <summary>
		/// Gets or sets the ReferredUserID value.
		/// </summary>
		public  int ReferredUserID
		{
			get { return referredUserID; }
			set { referredUserID = value; }
		}

		/// <summary>
		/// Gets or sets the DateAdded value.
		/// </summary>
		public  DateTime DateAdded
		{
			get { return dateAdded; }
			set { dateAdded = value; }
		}

		#endregion
	}
}
