
# JSBalance
Server process reads TABLE (e.g. MS Excel (TM)) with accounting history in Euros and then produces the account history for each account plus balances plus some reports

# TABLE FORMAT
 Each TABLE is used for a single legal entity, tabs/pages are for the various fiscal years
 In the TABLE a single page ('tab') is for one entity and one fiscal year 
 Each row in TABLE page is a transaction
 where each TABLE row has one column per account

# Assumptions Excel Columns
 The first six columns are for information on the specific transaction
 Column  'A' is a simple hash code that may be used as a signature for that transaction
 Column  'B' is the date of the transaction
 Column  'C' should be the money sender or money recipient 
 Column  'D' should be the Equity/Liability/Gain/Cost account that is affected
 Column  'E' should be the reason or keyword for the transaction
 Column  'F' should be the referring date interval e.g.month/quarter/year or an external identification code for that transaction 
 Columns 'G' on shall be asset accounts, preferably starting with fixed assets then currecny assets and then claims
 The limiting columns is then called ASSETS
 Subsequent columns shall be for Gain/Loss accounts i.e. revenues and cost
 The limiting columns is then called EQLIAB
 Subsequent columns shall be for Equity/Liability accounts, 
 preferably starting with long-term liabilities, short-term liabilities, then short-term-equity and then fixed equity

# Assumptions Excel Rows
 The first rows are for defining the account names and types
 these rows have an indicator in the first column  Column 'A' which is a control letter for the line type
 . indicates a comment
 N with N being some positive integer indicates a booking transaction
 1 should be the number used for the initital account opening statement
 C is for comments 
 N is for the account names, where 'C' has the contact person's full name and 'D' the entities legal residence address
 I is for the entity info, where 'B' has the primary entity IBAN, 'C' the company registry number, 'D' the entity tax number
 K is the internal account number (identifies the type of account), where 'C' is the reporting year  and 'D' the entity's legal name
 S is the share percentage of partner accounts where 'C' has the integer value of 100
 R is a report indicator with empty or 'x' - indicting that this account is on a summary report
 E is (K-derived) the equity xbrl use for partner accounts - with de-gaap-ci_table.kke.allKindsOfEquityAccounts.(un)limitedPartners.KK .FK .VK
 X is (K-derived) the general xbrl
 P is the partner name
 A is a fixed asset initial statement for that fiscal year
   where 'B' is the date, 'C'=AssetName, 'D'=PurchasingCost, 'E'=NumberOfItems, and the related account column holds the current balance value



# Assumptions Server
  TABLE file name syntax BOOK_<CLIENT><YEAR>.xlsx
 fiscal year runs from 01/01 to 12/31
 all amounts are in Euros   , colon for the cents fraction and . for powers of thousands 




# OUTPUT FROM SERVER /SHOW
 Documentation of server RESPONSE object
 [    D_Page     ]  current language strings for general terms
 [    D_XBRL     ]  XBRLs for each account
 [   D_Schema    ]  static schema of the booking table
 [   D_History   ]  history of booking transactions
 [   D_Balance   ]  balance
 [   D_Report    ]  gain/loss summaries
 [   D_FixAss    ]  list of fixed assets
 [ D_Partner_NET ]  partner tax summary
 [   D_Muster    ]  predefined templates for transactions
 [  D_Adressen   ]  predefined partner postal addresses

# SCHEMA
 

# D_Balance = Bilanz
    {:{"n":{"name":"n",
    "index":#,
    "desc":"$$$",
    "xbrl":"de-gaap-ci_bs.ass.fixAss.tan.landBuildings.buildingsOnOwnLand",
    "credit":"0",
    "debit":"-243000",
    "init":"14985000",
    "min":"14742000",
    "next":"14742000",
    "yearEnd":"14742000"},"}}

                    
# D_Balance {
"GRSB":{"name":"GRSB","index":6,"desc":"Immo","xbrl":"de-gaap-ci_bs.ass.fixAss.tan.landBuildings.buildingsOnOwnLand","init":"149.850,00","min":"149.850,00","credit":"0,00","debit":"0,00","yearEnd":"149.850,00","next":"149.850,00"},
"EBKS":{"name":"EBKS","index":7,"desc":"Sachanlage","xbrl":"de-gaap-ci_bs.ass.fixAss.tan.landBuildings.other","init":"282,00","min":"282,00","credit":"0,00","debit":"0,00","yearEnd":"282,00","next":"282,00"},
"CDAK":{"name":"CDAK","index":8,"desc":"Aktiendepot A","xbrl":"de-gaap-ci_bs.ass.fixAss.fin.securities","credit":"54.541,61","debit":"-40.927,60","init":"85.922,52","min":"53.626,72","yearEnd":"99.536,53","next":"99.536,53"},
"FSTF":{"name":"FSTF","index":9,"desc":"Forderung steuerfrei","xbrl":"de-gaap-ci_bs.ass.currAss.receiv.trade","credit":"3.000,00","debit":"-3.000,00","init":"0,00","min":"0,00","yearEnd":"0,00","next":"0,00"},
"COGK":{"name":"COGK","index":10,"desc":"Girokonto A","xbrl":"de-gaap-ci_bs.ass.currAss.cashEquiv.bank","credit":"71.859,67","debit":"-76.433,65","init":"5.516,54","min":"276,39","yearEnd":"942,56","next":"942,56"},
"SPGE":{"name":"SPGE","index":11,"desc":"Girokonto B","xbrl":"de-gaap-ci_bs.ass.currAss.cashEquiv.bank","init":"0,00","min":"0,00","credit":"0,00","debit":"0,00","yearEnd":"0,00","next":"0,00"},
"VDKB":{"name":"VDKB","index":12,"desc":"Verrechnung C","xbrl":"de-gaap-ci_bs.ass.currAss.cashEquiv.bank","init":"0,00","min":"0,00","credit":"0,00","debit":"0,00","yearEnd":"0,00","next":"0,00"},
"NKFO":{"name":"NKFO","index":13,"desc":"Forderung an Mieter aus Nebenkosten","xbrl":"de-gaap-ci_bs.ass.currAss.receiv.trade","credit":"0,00","debit":"-179,68","init":"154,68","min":"129,68","yearEnd":"-25,00","next":"-25,00"},
"KEST":{"name":"KEST","index":14,"desc":"gezahlte Kapitalertragssteuer","xbrl":"de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.CapTax","credit":"1.963,89","debit":"0,00","init":"0,00","min":"0,00","yearEnd":"1.963,89","next":"0,00"},
"KESO":{"name":"KESO","index":15,"desc":"gezahlte Soli-Abgabe auf Kapitalertragssteuer","xbrl":"de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.CapTax","credit":"107,98","debit":"0,00","init":"0,00","min":"0,00","yearEnd":"107,98","next":"0,00"},
"AQST":{"name":"AQST","index":16,"desc":"gezahlte Auslandsquellensteuer","xbrl":"de-gaap-ci_bs.ass.currAss.receiv.other.otherTaxRec.CapTax","init":"0,00","min":"0,00","credit":"0,00","debit":"0,00","yearEnd":"0,00","next":"0,00"},
"VAVA":{"name":"VAVA","index":17,"desc":"VerlusteAusVkAktien","xbrl":"de-gaap-ci_bs.ass.currAss.receiv.other.CapLoss","credit":"3.187,56","debit":"-3.187,56","init":"0,00","min":"-1.317,46","yearEnd":"0,00","next":"0,00"},
"MIET":{"name":"MIET","index":19,"desc":"Mieteinnahmen Umsatzsteuerfrei","xbrl":"de-gaap-ci_is.netIncome.regular.operatingTC.grossTradingProfit.totalOutput.netSales.grossSales.untaxable","credit":"14.762,00","debit":"0,00","init":"0,00","min":"0,00","yearEnd":"14.762,00","next":"0,00"},
"AUFW":{"name":"AUFW","index":20,"desc":"Aufwand Immobilie","xbrl":"de-gaap-ci_is.netIncome.regular.operatingTC.otherCost.fixingLandBuildings","credit":"0,00","debit":"-2.319,35","init":"0,00","min":"-534,35","yearEnd":"-2.319,35","next":"0,00"},
"ABSC":{"name":"ABSC","index":21,"desc":"Abschreibung der Anlagen am Jahresende","xbrl":"de-gaap-ci_is.netIncome.regular.operatingTC.deprAmort.fixAss.tan","init":"0,00","min":"0,00","credit":"0,00","debit":"0,00","yearEnd":"0,00","next":"0,00"},
"NKG":{"name":"NKG","index":22,"desc":"Nebenkosten des Geldverkehrs","xbrl":"de-gaap-ci_is.netIncome.regular.operatingTC.otherCost.otherOrdinary","credit":"0,00","debit":"-231,10","init":"0,00","min":"-224,15","yearEnd":"-231,10","next":"0,00"},
"AZIN":{"name":"AZIN","index":23,"desc":"Zinskosten für Kredite","xbrl":"de-gaap-ci_is.netIncome.regular.fin.expenses.regularInterest","init":"0,00","min":"0,00","credit":"0,00","debit":"0,00","yearEnd":"0,00","next":"0,00"},
"EZIN":{"name":"EZIN","index":24,"desc":"Zinseinnahmen","xbrl":"de-gaap-ci_is.netIncome.regular.fin.netInterest.income","init":"0,00","min":"0,00","credit":"0,00","debit":"0,00","yearEnd":"0,00","next":"0,00"},
"EDIV":{"name":"EDIV","index":25,"desc":"Dividende Finanzanlagen","xbrl":"de-gaap-ci_is.netIncome.regular.fin.netParticipation","credit":"4.321,60","debit":"0,00","init":"0,00","min":"0,00","yearEnd":"4.321,60","next":"0,00"},
"FSAL":{"name":"FSAL","index":26,"desc":"Gewinn aus Verkauf von Finanzanlagen","xbrl":"de-gaap-ci_is.netIncome.regular.fin.sale","credit":"2.148,88","debit":"0,00","init":"0,00","min":"0,00","yearEnd":"2.148,88","next":"0,00"},
"NKHA":{"name":"NKHA","index":27,"desc":"Nebenkosten der Vermietung","xbrl":"de-gaap-ci_is.netIncome.regular.operatingTC.otherCost.leaseFix.other","credit":"1.101,78","debit":"-1.053,40","init":"0,00","min":"-240,96","yearEnd":"48,38","next":"0,00"},
"KAUT":{"name":"KAUT","index":29,"desc":"Kaution des Mieters","xbrl":"de-gaap-ci_bs.eqLiab.liab.other.other","init":"3.000,00","min":"3.000,00","credit":"0,00","debit":"0,00","yearEnd":"3.000,00","next":"3.000,00"},
"G195":{"name":"G195","index":30,"desc":"KREDIT","xbrl":"de-gaap-ci_bs.eqLiab.liab.other.profSharRights","init":"50.000,00","min":"50.000,00","credit":"0,00","debit":"0,00","yearEnd":"50.000,00","next":"50.000,00"},
"K2xx":{"name":"K2xx","index":31,"desc":"Variables Eigenkapital xx","xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.VK","credit":"4.147,99","debit":"-3.600,00","init":"27.343,75","min":"27.343,75","yearEnd":"27.891,74","next":"31.223,45","income":"3.746,09","netIncomeOTC":"2.451,99","netIncomeFin":"1.294,10"},
"EKxx":{"name":"EKxx","index":42,"desc":"Stammkapital xx","xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.KK","init":"24.000,00","min":"24.000,00","credit":"0,00","debit":"0,00","yearEnd":"24.000,00","next":"24.000,00"},
"Name":{"name":"Name","index":1,"xbrl":"BALANCE","desc":"Kontonummer","init":"0,00","min":"0,00","credit":"0,00","debit":"0,00","next":"0,00","yearEnd":"0,00"}}

# D_FixAss =
{"NAME":{"date":"2016-01-01","type":"WKN","init":"162.000,00","nmbr":"1","idnt":"NAME","rest":"149.850,00","cost":"162.000,00"} }


D_Partner = {
i:{"id":i,"varCap":"K2xx","gain":n,"denom":z,
"iVar":31,"iCap":37,"name":name,
"tax":s,"cyLoss":s,"income":s,"netIncomeFin":s,"netIncomeOTC":s,"init":s,"credit":s,"debit":s,"yearEnd":s,"close":s,"next":s},
}


/*          D_Partner[i] = { }
            compile
                    id:     # 0-(N-1)
                    varCap  Name 'K2xx'
                    gain:   Nenner
                    denom:  Zaehler
                    iVar    #Spalte K2xx
                    iCap    #Spalte Fest/Kommanditkapital
                    resCap  Name RExx Rücklage
                    name    Name (Text in Spalte mit FK oder KK)

            sendBalance
                    cyLoss Laufende Verluste aus Veraesserungen VAVA
                    keso
                    kest
                    income
                    otc
                    cap

                    netIncomeFin
                    netIncomeOTC
*/


D_REPORT = {
"xbrlEqfix":{"level":3,"xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.FK","de_DE":"Festkapital","account":{"name":"Festkapital","desc":"Festkapital","xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.FK","credit":"24.000,00","debit":"0,00","init":"24.000,00","min":"0,00","gross":"24.000,00"}},

"xbrlEqlim":{"level":3,"xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.KK","de_DE":"Kommanditkapital","account":{"name":"Kommanditkapital","desc":"Kommanditkapital","xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.KK","credit":"96.000,00","debit":"0,00","init":"96.000,00","min":"0,00","gross":"96.000,00"}},

"xbrlEVulp":{"level":3,"xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.VK","de_DE":"Komplementär-VK","account":{"name":"Komplementär-VK","desc":"Komplementär-VK","xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.VK","credit":"61.711,98","debit":"0,00","init":"54.687,50","min":"0,00","gross":"61.711,98"}},

"xbrlEVlim":{"level":3,"xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.VK","de_DE":"Kommanditisten-VK","account":{"name":"Kommanditisten-VK","desc":"Kommanditisten-VK","xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.VK","credit":"5.594,06","debit":"0,00","init":"14.038,24","min":"0,00","gross":"5.594,06"}},

"xbrlUVAVA":{"level":3,"xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.accumLoss","de_DE":"Verlust FA Komplem.","account":{"name":"Verlust FA Komplem.","desc":"Verlust FA Komplem.","xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.unlimitedLiablePartners.accumLoss","init":"0,00","min":"0,00","credit":"0,00","debit":"0,00","gross":"0,00"}},

"xbrlLVAVA":{"level":3,"xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.accumLoss","de_DE":"Verlust FA Kommmand.","account":{"name":"Verlust FA Kommmand.","desc":"Verlust FA Kommmand.","xbrl":"de-gaap-ci_bs.eqLiab.equity.subscribed.limitedLiablePartners.accumLoss","init":"0,00","min":"0,00","credit":"0,00","debit":"0,00","gross":"0,00"}},

"xbrlEquity":{"level":2,"xbrl":"de-gaap-ci_bs.eqLiab.equity","de_DE":"Eigenkapital","account":{"name":"Eigenkapital","desc":"Eigenkapital","xbrl":"de-gaap-ci_bs.eqLiab.equity","credit":"187.306,04","debit":"0,00","init":"188.725,74","min":"0,00","gross":"187.306,04"}},

"xbrlRegFin":{"level":3,"xbrl":"de-gaap-ci_is.netIncome.regular.fin","de_DE":"Finanzergebnis","account":{"name":"Finanzergebnis","desc":"Finanzergebnis","xbrl":"de-gaap-ci_is.netIncome.regular.fin","credit":"6.470,48","debit":"0,00","init":"0,00","min":"0,00","gross":"6.470,48"}},

"xbrlRegOTC":{"level":3,"xbrl":"de-gaap-ci_is.netIncome.regular.operatingTC","de_DE":"Betriebsergebnis","account":{"name":"Betriebsergebnis","desc":"Betriebsergebnis","xbrl":"de-gaap-ci_is.netIncome.regular.operatingTC","credit":"12.119,77","debit":"-686,99","init":"0,00","min":"0,00","gross":"11.432,78"}},

"xbrlRegular":{"level":2,"xbrl":"de-gaap-ci_is.netIncome.regular","de_DE":"Gewinn/Verlust","account":{"name":"Gewinn/Verlust","desc":"Gewinn/Verlust","xbrl":"de-gaap-ci_is.netIncome.regular","credit":"18.590,25","debit":"-686,99","init":"0,00","min":"0,00","gross":"17.903,26"}},

"xbrlEqLiab":{"level":2,"xbrl":"de-gaap-ci_bs.eqLiab","de_DE":"Passiva o G","account":{"name":"Passiva o G","desc":"Passiva o G","xbrl":"de-gaap-ci_bs.eqLiab","credit":"240.306,04","debit":"0,00","init":"241.725,74","min":"0,00","gross":"240.306,04"}},

"xbrlIncome":{"level":1,"xbrl":"de-gaap-ci_bs.eqLiab.income","de_DE":"Passiva","account":{"name":"Passiva","desc":"Passiva","xbrl":"de-gaap-ci_bs.eqLiab.income","init":"0,00","min":"0,00","credit":"0,00","debit":"0,00","gross":"0,00"}}}


```json
 {
    "Desc": [
        "C",
        "(bank account)",
        "Sender",
        "Konto",
        "SVWZ1",
        "SVWZ2",
        "REAL1",
        "REAL2",
        "Aktiendepot",
        "Forderungen steuerfrei",
        "Girokonto1",
        "Girokonto2",
        "Bank3",
        "Forderung an Mieter aus Nebenkosten",
        "gezahlte Kapitalertragssteuer",
        "gezahlte Soli-Abgabe auf Kapitalertragssteuer",
        "gezahlte Auslandsquellensteuer",
        "VerlusteAusVkAktien",
        "Summe aller Aktivposten",
        "Mieteinnahmen Umsatzsteuerfrei",
        "Aufwand Immobilie",
        "Abschreibung der Anlagen am Jahresende",
        "Nebenkosten des Geldverkehrs",
        "Zinskosten für Kredite",
        "Zinseinnahmen",
        "Dividende Finanzanlagen",
        "Gewinn aus Verkauf von Finanzanlagen",
        "Nebenkosten der Vermietung",
        "Summe der Passivkonten",
        "Kaution des Mieters",
        "Verbindlichkeiten2",
        "Variables Eigenkapital1",
        "Variables Eigenkapital2",
        "Variables Eigenkapital3",
        "Variables Eigenkapital4",
        "Variables Eigenkapital5",
        "Variables Eigenkapital6",
        "Stammkapital 1",
        "Stammkapital 2",
        "Stammkapital Partner1",
        "Stammkapital Partner2",
        "Stammkapital Partner3",
        "Stammkapital Partner4"
    ],
    "Names": [
        "N",
        "Name",
        "(Contact)",
        "(CompanyResidence)",
        ".",
        ".",
        "GRSB",
        "EBKS",
        "CDAK",
        "FSTF",
        "COGK",
        "SPGE",
        "VDKB",
        "NKFO",
        "KEST",
        "KESO",
        "AQST",
        "VAVA",
        "ASSETS",
        "MIET",
        "AUFW",
        "ABSC",
        "NKG",
        "AZIN",
        "EZIN",
        "EDIV",
        "FSAL",
        "NKHA",
        "EQLIAB",
        "KAUT",
        "G195",
        "K2GH",
        "K2EH",
        "K2AL",
        "K2KR",
        "K2TO",
        "K2LE",
        "EKGH",
        "EKEH",
        "EKAL",
        "EKKR",
        "EKTO",
        "EKLE"
    ],
    "assets": 18,
    "eqliab": 28,
    "total": 43,
    "author": "(author)",
    "residence": "(residence)",
    "iban": "(iban)",
    "register": "(register)",
    "taxnumber": "(taxnumber)",
    "reportYear": "2022",
    "client": "(entityname))"
}
