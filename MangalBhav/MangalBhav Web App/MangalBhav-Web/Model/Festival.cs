using System;
namespace FaceUPAI.Models
{
	public class Festival
	{
		#region Fields

		private int festivalID;
		private string festivalName;
		private string description;
		private DateTime festivalDate;
		private int year;
		private string countryCode;
		private string countryName;
		private string type;
		private string primaryType;
		private string locations;
		private string states;
		private string canonicalURL;
		private string urlID;
		private DateTime dateAdded;

		#endregion

		#region Constructors

		/// <summary>
		/// Initializes a new instance of the Festival class.
		/// </summary>
		public Festival()
		{
		}

		/// <summary>
		/// Initializes a new instance of the Festival class.
		/// </summary>
		public Festival(string festivalName, string description, DateTime festivalDate, int year, string countryCode, string countryName, string type, string primaryType, string locations, string states, string canonicalURL, string urlID, DateTime dateAdded)
		{
			this.festivalName = festivalName;
			this.description = description;
			this.festivalDate = festivalDate;
			this.year = year;
			this.countryCode = countryCode;
			this.countryName = countryName;
			this.type = type;
			this.primaryType = primaryType;
			this.locations = locations;
			this.states = states;
			this.canonicalURL = canonicalURL;
			this.urlID = urlID;
			this.dateAdded = dateAdded;
		}

		/// <summary>
		/// Initializes a new instance of the Festival class.
		/// </summary>
		public Festival(int festivalID, string festivalName, string description, DateTime festivalDate, int year, string countryCode, string countryName, string type, string primaryType, string locations, string states, string canonicalURL, string urlID, DateTime dateAdded)
		{
			this.festivalID = festivalID;
			this.festivalName = festivalName;
			this.description = description;
			this.festivalDate = festivalDate;
			this.year = year;
			this.countryCode = countryCode;
			this.countryName = countryName;
			this.type = type;
			this.primaryType = primaryType;
			this.locations = locations;
			this.states = states;
			this.canonicalURL = canonicalURL;
			this.urlID = urlID;
			this.dateAdded = dateAdded;
		}

		#endregion

		#region Properties
		/// <summary>
		/// Gets or sets the FestivalID value.
		/// </summary>
		public  int FestivalID
		{
			get { return festivalID; }
			set { festivalID = value; }
		}

		/// <summary>
		/// Gets or sets the FestivalName value.
		/// </summary>
		public  string FestivalName
		{
			get { return festivalName; }
			set { festivalName = value; }
		}

		/// <summary>
		/// Gets or sets the Description value.
		/// </summary>
		public  string Description
		{
			get { return description; }
			set { description = value; }
		}

		/// <summary>
		/// Gets or sets the FestivalDate value.
		/// </summary>
		public  DateTime FestivalDate
		{
			get { return festivalDate; }
			set { festivalDate = value; }
		}

		/// <summary>
		/// Gets or sets the Year value.
		/// </summary>
		public  int Year
		{
			get { return year; }
			set { year = value; }
		}

		/// <summary>
		/// Gets or sets the CountryCode value.
		/// </summary>
		public  string CountryCode
		{
			get { return countryCode; }
			set { countryCode = value; }
		}

		/// <summary>
		/// Gets or sets the CountryName value.
		/// </summary>
		public  string CountryName
		{
			get { return countryName; }
			set { countryName = value; }
		}

		/// <summary>
		/// Gets or sets the Type value.
		/// </summary>
		public  string Type
		{
			get { return type; }
			set { type = value; }
		}

		/// <summary>
		/// Gets or sets the PrimaryType value.
		/// </summary>
		public  string PrimaryType
		{
			get { return primaryType; }
			set { primaryType = value; }
		}

		/// <summary>
		/// Gets or sets the Locations value.
		/// </summary>
		public  string Locations
		{
			get { return locations; }
			set { locations = value; }
		}

		/// <summary>
		/// Gets or sets the States value.
		/// </summary>
		public  string States
		{
			get { return states; }
			set { states = value; }
		}

		/// <summary>
		/// Gets or sets the CanonicalURL value.
		/// </summary>
		public  string CanonicalURL
		{
			get { return canonicalURL; }
			set { canonicalURL = value; }
		}

		/// <summary>
		/// Gets or sets the UrlID value.
		/// </summary>
		public  string UrlID
		{
			get { return urlID; }
			set { urlID = value; }
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
