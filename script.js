const container = document.querySelector(".input-group");
const infoContainer = document.getElementById("infoContainer");
const segments = [2, 2, 1, 3, 3, 1];
const inputFields = [];
let lastKeyWasBackspace = false;

segments.forEach((length, index) => {
    const segmentContainer = document.createElement("div");
    segmentContainer.classList.add("d-flex");

    for (let i = 0; i < length; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.classList.add("form-control", "text-center");
        input.inputMode = "numeric"; 
        input.dataset.segment = index;
        input.dataset.indexInSegment = i;
        segmentContainer.appendChild(input);
        inputFields.push(input);
    }

    container.appendChild(segmentContainer);
});

inputFields.forEach((input, index) => {
    input.addEventListener("input", (e) => {
        if (e.target.value.length === 1 && index < inputFields.length - 1) {
            inputFields[index + 1].focus();
        }
        updateChecksum();
        updateTrainInfo();
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace") {
            if (!e.target.value && index > 0 && lastKeyWasBackspace) {
                inputFields[index - 1].focus();
                inputFields[index - 1].value = '';
                e.preventDefault();
            }
            lastKeyWasBackspace = true;
        } else {
            lastKeyWasBackspace = false;
        }
    });

    input.addEventListener("paste", (e) => {
        const pasteData = e.clipboardData.getData('text');
        if (/^\d{11,12}$/.test(pasteData)) {
            e.preventDefault();
            for (let i = 0; i < 11; i++) {
                inputFields[i].value = pasteData[i] || '';
            }
            updateChecksum();
            updateTrainInfo();
        }
    });
});

function updateChecksum() {
    let allFilled = inputFields.slice(0, 11).every(input => input.value);
    if (allFilled) {
        const weights = [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
        let sum = 0;
        inputFields.slice(0, 11).forEach((input, i) => {
            let product = parseInt(input.value) * weights[i];
            sum += product > 9 ? product - 9 : product;
        });
        const checksum = (10 - (sum % 10)) % 10;
        inputFields[11].value = checksum;
        inputFields[11].classList.add("fw-bold");
        inputFields[11].disabled = true;
    } else {
        inputFields[11].value = '';
    }
}

document.getElementById("copyButton").addEventListener("click", () => {
    const fullNumber = inputFields.map(input => input.value || "").join("");
    navigator.clipboard.writeText(fullNumber).then(() => {
        alert("Pályaszám vágólapra másolva: " + fullNumber);
    }).catch(err => {
        alert("Hiba történt a másolás során: " + err);
    });
});

document.getElementById("clearButton").addEventListener("click", () => {
    inputFields.forEach(input => input.value = "");
    inputFields[0].focus();
    infoContainer.innerHTML = "";
});

window.onload = () => {
    inputFields[0].focus();
};

function updateTrainInfo() {
    const firstDigit = parseInt(inputFields[0].value);
    const secondDigit = parseInt(inputFields[1].value);
    const fifthDigit = parseInt(inputFields[4].value);
    const countryCode = inputFields.slice(2, 4).map(input => input.value).join("");
    let infoText = "";

    if (!isNaN(firstDigit)) {
        if (firstDigit >= 0 && firstDigit <= 3) {
            infoText += "1. számjegy: <b>Teherkocsi</b><br>";
        } else if (firstDigit === 4 || firstDigit === 5) {
            infoText += "1. számjegy: <b>Személyszállító jármű</b><br>";
        } else if (firstDigit === 6) {
            infoText += "1. számjegy: <b>Villamos motorvonat/mozdony</b><br>";
        } else if (firstDigit === 7) {
            infoText += "1. számjegy: <b>Dízel motorvonat</b><br>";
        } else if (firstDigit >= 8 && firstDigit <= 9) {
            infoText += "1. számjegy: <b>Vontatójármű</b><br>";
        }
    }

    if (!isNaN(secondDigit)) {
        const descriptions = [
            "gőz-, hibridmozdony, városi vasutak és trolibusz",
            "villamos mozdony (V ≥ 100 km/h)",
            "dízel mozdony (V ≥ 100 km/h)",
            "nagysebességű villamos motorkocsi/vonat (V ≥ 190 km/h)",
            "villamos motorkocsi/vonat (V < 190 km/h)",
            "dízel motorkocsi/vonat + első 30 Flirt + keskeny nyomközű dízelmozdony",
            "különleges mellék-, vagy pótkocsi",
            "villamos tolatómozdony (V < 100 km/h)",
            "dízel tolatómozdony (V < 100 km/h)",
            "speciális, építési és karbantartási járművek"
        ];
        if (secondDigit >= 0 && secondDigit <= 9) {
            infoText += `2. számjegy: <b>${descriptions[secondDigit]}</b><br>`;
        }
    }

    const countryCodes = {
        "06": "StL Holland (Stena Line Holland BV) - NL",
        "10": "VR (VR-Yhtymä Oy) - FI",
        "12": "TRFSA (Transfesa Logistics SA) - ES",
        "13": "OSJD (OSJD) - PL",
        "14": "CWL (Compagnie des Wagons-Lits) - FR",
        "15": "RMF (Rail Manche Finance) - GB",
        "16": "RD (RAILDATA) - CH",
        "17": "ENS (European Night Services Ltd) - GB",
        "18": "THI Factory (THI Factory SA) - BE",
        "19": "Eurostar I (Eurostar International Limited) - GB",
        "20": "OAO RZD (Joint Stock Company 'Russian Railways') - RU",
        "21": "BC (Belarusian Railways) - BY",
        "22": "UZ (Ukrainski Zaliznytsi) - UA",
        "23": "CFM (Calea Ferată din Moldova) - MD",
        "24": "LTG (AB 'Lietuvos geležinkeliai') - LT",
        "25": "LDZ (Latvijas dzelzceļš) - LV",
        "26": "EVR (Aktsiaselts Eesti Raudtee) - EE",
        "27": "KTZ (Kazakhstan Temir Zholy) - KZ",
        "28": "GR (Sakartvelos Rkinigza) - GE",
        "29": "UTI (Uzbekistan Temir Yullari) - UZ",
        "30": "ZC (Railways of D.P.R.K.) - KP",
        "31": "UBTZ (Mongolian-Russian Joint-Stock Company 'Ulaanbaatar railway') - MN",
        "32": "DSVN (đường sắt Việt Nam) - VN",
        "33": "CR (Chinese Railways) - CN",
        "41": "HSH (Hekurudha Shqiptarë SH.A.) - AL",
        "42": "JR-E (East Japan Railway Company) - ",
        "43": "GySEV/Raaberbahn (Győr-Sopron-Ebenfurti Vasút Zrt.) - HU",
        "44": "ŽRS (Željeznice Republike Srpske) - BA",
        "50": "ŽFBH (J.P. Željeznice Federacije BiH d.o.o.) - BA",
        "51": "PKP PLK S.A. (PKP Polskie Linie Kolejowe S.A.) - PL",
        "52": "NRIC (National Railway Infrastructure Company) - BG",
        "53": "CFR SA (Compania Naţională de Căi Ferate Române) - RO",
        "54": "SZCZ (Správa železnic, statni organizace) - CZ",
        "55": "MÁV (Magyar Államvasutak Zrt.) - HU",
        "56": "ŽSR (Železnice Slovenskej Republiky) - SK",
        "57": "ADY (Azerbaidjan Railways CJSC) - AZ",
        "58": "CJSC SCR (South Caucasus Railway CJSC) - AM",
        "59": "KTJ (Kyrgyz Railways) - KG",
        "60": "CIE (Córas Iompair Éireann) - IE",
        "61": "KORAIL (Korea Railroad Corporation) - KR",
        "63": "BLS N (BLS Netz AG Infrastrukturmanager) - CH",
        "64": "FN (Ferrovienord S.p.A.) - IT",
        "65": "CFARYM-I (Makedonski Železnici Infrastructure-Skopje) - MK",
        "66": "TDZ (Tajikistan Railways) - TJ",
        "67": "TRK (Turkmenistan Railways) - TM",
        "68": "AAEC (AAE Ahaus Alstätter Eisenbahn Cargo AG) - ",
        "69": "EUROT (EUROTUNNEL) - FR",
        "70": "Network Rail (Network Rail Limited) - GB",
        "71": "ADIF (Administrator de Infraestructuras Ferroviarias) - ES",
        "72": "IŽS (Infrastruktura Železnice Srbije) - RS",
        "73": "OSE (Organismos Sidirodromon Ellados) - GR",
        "74": "TRAFIKVERKET (Trafikverket) - SE",
        "75": "TCDD Taşımacılık A.Ş. (Türkiye Cumhuriyeti Devlet Demiryolları Taşımacılık Anonim Şirketi) - TR",
        "76": "BN (Bane NOR SF) - NO",
        "77": "FS EPA (Ferrovie dello Stato Italiane SpA EPA) - IT",
        "78": "HŽ-Infrastruktura (HŽ Infrastruktura d.o.o.) - HR",
        "79": "SŽ - Infrastruktura, d.o.o. (Slovenske železnice - Infrastruktura, d.o.o.) - SI",
        "80": "DB InfraGO (DB InfraGO Aktiengesellschaft) - DE",
        "81": "ÖBB-Holding AG (ÖBB-Holding AG) - AT",
        "82": "CFL Infrastructure (Societé Nationale des Chemins de Fer Luxembourgeois) - LU",
        "83": "RFI  (Rete Ferroviaria Italiana SpA) - IT",
        "84": "ProRail (ProRail) - NL",
        "85": "SBB Infrastructure  (Swiss Federal Railways - Infrastructure) - CH",
        "86": "Banedanmark (Banedanmark (RailNet Denmark)) - DK",
        "87": "SNCF Réseau (SNCF Réseau SA) - FR",
        "88": "Infrabel (Infrabel) - BE",
        "90": "ENR (Egyptian National Railways) - EG",
        "91": "SNCFT (Société Nationale des Chemins de Fer Tunisiens) - TN",
        "92": "SNTF (Société Nationale des Transports Ferroviaires) - DZ",
        "93": "ONCF (Office National des Chemins de Fer du Maroc) - MA",
        "94": "IP (Infraestruturas de Portugal S.A.) - PT",
        "95": "ISR (Israel Railways) - IL",
        "96": "RAI (Rahahan-e Djjomhouri-e Eslami Iran) - IR",
        "97": "CFS (Administration Générale des Chemins de fer Syriens) - SY",
        "98": "CEL (Lebanon Railways) - LB",
        "99": "IRR (Iraqi Republic Railways Establishment) - IQ"
    };

    if (countryCodes[countryCode]) {
        infoText += `3-4. számjegy: <b>${countryCodes[countryCode]}</b><br>`;
    }

    if (!isNaN(fifthDigit)) {
        const fifthDescriptions = [
            "egytagú egység",
            "többtagú egység 1. (A) tagja",
            "többtagú egység 2. (B) tagja",
            "többtagú egység 3. tagja",
            "többtagú egység 4. tagja",
            "többtagú egység 5. tagja",
            "többtagú egység 6. tagja",
            "csatolt, 10-nél több tengelyű mozdony, a hatodik jegy a hajtott kerékpárok számát adja (n-10)",
            "eltérő nyomtávú egység",
            "speciális járművek"
        ];
        if (fifthDigit >= 0 && fifthDigit <= 9) {
            infoText += `5. számjegy: <b>${fifthDescriptions[fifthDigit]}</b><br>`;
        }
    }

    const sixthDigit = parseInt(inputFields[5].value);
    if (!isNaN(sixthDigit)) {
        infoText += `6. számjegy: Hajtott kerékpárok száma: <b>${sixthDigit}</b><br>`;
    }

    const seventhDigit = parseInt(inputFields[6].value);
    if (!isNaN(seventhDigit)) {
        infoText += `7. számjegy: Azonos csoporton belüli típusszám: <b>${seventhDigit}</b><br>`;
    }

    const eighthDescriptions = [
        "villanymozdony-sorozaton belüli főváltozat",
        "villanymozdony-sorozaton belüli A változat",
        "villanymozdony-sorozaton belüli B változat",
        "villanymozdony-sorozaton belüli C változat",
        "villamos motorkocsi sorozat A",
        "villamos motorvonat sorozat B",
        "dízel motorvonat sorozat A",
        "dízel motorkocsi sorozat B",
        "dízelmozdony-sorozaton belüli változat A",
        "dízelmozdony-sorozaton belüli változat B"
    ];

    const eighthDigit = parseInt(inputFields[7].value);
    if (!isNaN(eighthDigit) && eighthDigit >= 0 && eighthDigit <= 9) {
        infoText += `8. számjegy: <b>${eighthDescriptions[eighthDigit]}</b><br>`;
    }

    const serialNumber = inputFields.slice(8, 11).map(input => input.value).join("");
    if (serialNumber.length === 3) {
        infoText += `9-11. számjegy: Jármű egyedi sorszáma: <b>${serialNumber}</b><br>`;
    }

    const checksum = inputFields[11].value;
    if (checksum) {
        infoText += `12. számjegy: Ellenőrző szám: <b>${checksum}</b><br>`;
    }

    infoContainer.innerHTML = infoText;
}
