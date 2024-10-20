const container = document.querySelector(".input-group");
const infoContainer = document.getElementById("infoContainer");
const segments = [2, 2, 1, 3, 3, 1];
const inputFields = [];
let lastKeyWasBackspace = false;

segments.forEach((length, index) => {
    const segmentContainer = document.createElement("div");
    segmentContainer.classList.add("d-flex", "gap-2");

    for (let i = 0; i < length; i++) {
        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.classList.add("form-control", "text-center");
        input.inputMode = "numeric"; // Számbillentyűzet mobilon
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
        "43": "GySEV/Raaberbahn (Győr-Sopron-Ebenfurti Vasút Zrt.) - HU",
        "55": "MÁV (Magyar Államvasutak Zrt.) - HU",
        // Add further country codes as needed...
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
