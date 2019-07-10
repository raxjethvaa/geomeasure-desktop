(function() {
  var Clearbit, providePlugin,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  providePlugin = function(pluginName, pluginConstructor) {
    var tryApply = function() {
      var ga = window[window['GoogleAnalyticsObject'] || 'ga'];

      if (typeof ga === 'function') {
        ga('provide', pluginName, pluginConstructor);
        return true;
      } else {
        return false;
      }
    }

    if (tryApply()) {
      // Native support
    } else if (window.analytics && typeof window.analytics.ready === 'function') {
      // Segment support
      analytics.ready(tryApply);
    } else {
      console.error("Clearbit error: 'ga' variable not found.");
    }
  };

  Clearbit = (function() {
      function Clearbit(tracker, config) {
        this.tracker = tracker;
        this.config = config != null ? config : {};
        this.triggerEvent = bind(this.triggerEvent, this);
        this.setIPDimensions = bind(this.setIPDimensions, this);
        this.setDimensions = bind(this.setDimensions, this);
        this.set = bind(this.set, this);
        this.done = bind(this.done, this);
        this.mapping = this.config.mapping || {};
        this.done({"ip":"123.201.19.8","domain":"bmacinfotech.com","fuzzy":true,"company":{"id":"207ae55c-e619-40fd-a952-99bf2d2cb6a2","name":"BMAC Infotech","legalName":null,"domain":"bmacinfotech.com","domainAliases":[],"site":{"phoneNumbers":["+91 88660 77070","+84 8 4625 0592","+91 94266 77604"],"emailAddresses":["info@bmacinfotech.com"]},"category":{"sector":"Information Technology","industryGroup":"Software \u0026 Services","industry":"Internet Software \u0026 Services","subIndustry":"Internet Software \u0026 Services","sicCode":"73","naicsCode":"54"},"tags":["Technology","Information Technology \u0026 Services","Mobile","B2B","SAAS"],"description":"BMAC Infotech is a Mobile App and Web development company based in the heart of Rajkot, Gujarat. We have a team of individuals who all bring something unique to the creative table, including: UI/UX, Front End/Back End dev, Graphic Design, mobile app de...","foundedYear":2013,"location":"BMAC Info Tech Office no. 95/96, Samruddhi bhavan, Gondal road., Rajkot, 360005, India","timeZone":null,"utcOffset":null,"geo":{"streetNumber":null,"streetName":null,"subPremise":null,"city":null,"postalCode":null,"state":null,"stateCode":null,"country":null,"countryCode":null,"lat":null,"lng":null},"logo":"https://logo.clearbit.com/bmacinfotech.com","facebook":{"handle":"bmacinfotech","likes":821},"linkedin":{"handle":"company/bmac-infotech"},"twitter":{"handle":"bmacinfotech","id":"2983724870","bio":"We are a fastest growing, a very dynamic company and always ready to new challenges. We develop Mobile Apps, Web that are Optimized, Efficient \u0026 User Friendly.","followers":904,"following":1469,"location":"Rajkot, India","site":"http://t.co/boQnQthXE0","avatar":"https://pbs.twimg.com/profile_images/570505883809890304/1XIdvolz_normal.png"},"crunchbase":{"handle":null},"emailProvider":false,"type":"private","ticker":null,"identifiers":{"usEIN":null},"phone":null,"metrics":{"alexaUsRank":null,"alexaGlobalRank":9577961,"employees":null,"employeesRange":null,"marketCap":null,"raised":null,"annualRevenue":null,"estimatedAnnualRevenue":null,"fiscalYearEnd":null},"indexedAt":"2019-06-10T00:56:14.719Z","tech":["godaddy_nameserver","google_analytics","apache"],"parent":{"domain":null},"ultimate_parent":{"domain":null}}});
      }
      Clearbit.prototype.done = function(response) {
          if (response) {
             this.setIPDimensions(response);
             if (response.company){
                 this.setDimensions(response.company);
            }
            return this.triggerEvent();
         }
       };
        Clearbit.prototype.set = function(key, value) {
         if (key && value) {
           return this.tracker.set(key, value);
         }
       };
        Clearbit.prototype.setIPDimensions = function(response) {
         if (typeof response.type !== 'undefined') {
           this.set(this.mapping.type, response.type)
         }
       }

    Clearbit.prototype.setDimensions = function(company) {
      var ref, ref1;
      this.set(this.mapping.companyName, company.name);
      this.set(this.mapping.companyDomain, company.domain);
      this.set(this.mapping.companyType, company.type);
      this.set(this.mapping.companyTags, (ref = company.tags) != null ? ref.join(',') : void 0);
      this.set(this.mapping.companyTech, (ref1 = company.tech) != null ? ref1.join(',') : void 0);
      this.set(this.mapping.companySector, company.category.sector);
      this.set(this.mapping.companyIndustryGroup, company.category.industryGroup);
      this.set(this.mapping.companyIndustry, company.category.industry);
      this.set(this.mapping.companySubIndustry, company.category.subIndustry);
      this.set(this.mapping.companySicCode, company.category.sicCode);
      this.set(this.mapping.companyNaicsCode, company.category.naicsCode);
      this.set(this.mapping.companyCountry, company.geo.countryCode);
      this.set(this.mapping.companyState, company.geo.stateCode);
      this.set(this.mapping.companyCity, company.geo.city);
      this.set(this.mapping.companyFunding, company.metrics.raised);
      this.set(this.mapping.companyEstimatedAnnualRevenue, company.metrics.estimatedAnnualRevenue);
      this.set(this.mapping.companyEmployeesRange, company.metrics.employeesRange);
      this.set(this.mapping.companyEmployees, company.metrics.employees);
      return this.set(this.mapping.companyAlexaRank, company.metrics.alexaGlobalRank);
    };

    Clearbit.prototype.triggerEvent = function() {
      return this.tracker.send(
        'event',
        'Clearbit',
        'Enriched',
        'Clearbit Enriched',
        {nonInteraction: true}
      );
    };

    return Clearbit;

  })();

  providePlugin('Clearbit', Clearbit);

  

  

}).call(this);
