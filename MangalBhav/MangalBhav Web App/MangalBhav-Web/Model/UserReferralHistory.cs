using System;
namespace FaceUPAI.Models
{
	public class UserReferralHistory
	{
		#region Fields

		private int userReferralHistoryID;
		private int referrerUserID;
		private int referredUserID;
		private string referralCode;
		private DateTime referralDate;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the UserReferralHistory class.
		/// </summary>
		public UserReferralHistory()
		{
		}

		/// <summary>
		/// Initializes a new instance of the UserReferralHistory class.
		/// </summary>
		public UserReferralHistory(int referrerUserID, int referredUserID, string referralCode, DateTime referralDate)
		{
			this.referrerUserID = referrerUserID;
			this.referredUserID = referredUserID;
			this.referralCode = referralCode;
			this.referralDate = referralDate;
		}

		/// <summary>
		/// Initializes a new instance of the UserReferralHistory class.
		/// </summary>
		public UserReferralHistory(int userReferralHistoryID, int referrerUserID, int referredUserID, string referralCode, DateTime referralDate)
		{
			this.userReferralHistoryID = userReferralHistoryID;
			this.referrerUserID = referrerUserID;
			this.referredUserID = referredUserID;
			this.referralCode = referralCode;
			this.referralDate = referralDate;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the UserReferralHistoryID value.
		/// </summary>
		public  int UserReferralHistoryID
		{
			get { return userReferralHistoryID; }
			set { userReferralHistoryID = value; }
		}

		/// <summary>
		/// Gets or sets the ReferrerUserID value.
		/// </summary>
		public  int ReferrerUserID
		{
			get { return referrerUserID; }
			set { referrerUserID = value; }
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
		/// Gets or sets the ReferralCode value.
		/// </summary>
		public  string ReferralCode
		{
			get { return referralCode; }
			set { referralCode = value; }
		}

		/// <summary>
		/// Gets or sets the ReferralDate value.
		/// </summary>
		public  DateTime ReferralDate
		{
			get { return referralDate; }
			set { referralDate = value; }
		}

		#endregion
	}
}
