function Calc() {
    var valbox = document.forms["calculadora"]
    var submaskInput = valbox["submask"].value;
    var submask;

    /**
     * @type {string}
     */
    var ipInput = valbox["ip"].value;

    /**
     * @type {number}
     */
    var base;

    /**
     * @const
     * @type {number}
     */
    var BITS_MAX = 32;

    /**
     * @const
     * @type {number}
     */
    var OCTET_MAX = 255;

    /**
     * @const
     * @type {string}
     */
    var INVAL_IP = "Número de IP Inválido!";

    /**
     * @const
     * @type {string}
     */
    var INVAL_SM = "Número de máscara Inválido!";

    /**
     * @const
     * @type {string}
     */
    var INVAL_BASE = "Algo de errado não está certo";

    if (submaskInput <= BITS_MAX) {
        base = +submaskInput;
        submask = intToQdot(mask(base));
    }
    if (4 === submaskInput.split(".").length) {
        base = getCidr(submaskInput);
        submask = submaskInput;
    }
    if (notNum(base)) {
        throwError(INVAL_BASE);
    }
    if (!base) {
        submask = defaultSubmask(+ipInput.split(".")[0])
        base = getCidr(submask)
    }
    var ipInputArray = ipInput.split(".");
    var submaskInputArray = submask.split(".");

    /**
     * @param {string} item_to_val string to be validated
     */
    function validate(item_to_val, ip) {
        var itv_arr = item_to_val.split(".");
        if (4 !== itv_arr.length || "" === item_to_val) {
            ip ? throwError(INVAL_IP) : throwError(INVAL_SM)
        }

        for (var j = 0; j < 4; j++) {
            var itv_int = +itv_arr[j];
            if (itv_int != itv_arr[j] || itv_int < 0 || itv_int > OCTET_MAX) {
                ip ? throwError(INVAL_IP) : throwError(INVAL_SM)
            }
        }
    }

    validate(ipInput, true);
    validate(submask, false);

    /**
     * @param {string} error message
     * @throws generic error message
     */
    function throwError(error) {
        document.getElementById("tablecidr").innerHTML = error;
        document.getElementById("tablesubmask").innerHTML = error;
        // document.getElementById("tablebinarysub").innerHTML = error;
        document.getElementById("tablenumhosts").innerHTML = error;
        // document.getElementById("tablewildcardmask").innerHTML = error;
        document.getElementById("tableipclass").innerHTML = error;
        // document.getElementById("tableiptohex").innerHTML = error;
        // document.getElementById("tablebinaryip").innerHTML = error;
        document.getElementById("tablenetworkid").innerHTML = error;
        document.getElementById("tablebroadcastaddress").innerHTML = error;
        document.getElementById("tablenetworkinicial").innerHTML = error;
        document.getElementById("tablenetworkfinal").innerHTML = error;
        document.getElementById("tablenumgrupos").innerHTML = error;

        throw new Error(error);
    }

    /**
     * @param {number} n
     * @return {boolean} false if valid number
     */
    function notNum(n) {
        return ('undefined' === typeof n || isNaN(n) || null === n);
    }

    /**
     * @param {Array<string>} ip a quad-dotted IPv4 address -> array
     * @return {number} a 32-bit integer representation of an IPv4 address
     */
    function qdotToInt(ip) {
        var i = 0,
            x = 0;

        while (i < 4) {
            x <<= 8
            x += +ip[i++]
        }

        return x >>> 0;
    }

    /**
     * @param {number} n a 32-bit integer representation of an IPv4 address
     * @return {string} a quad-dotted IPv4 address
     */
    function intToQdot(n) {
        return [n >>> 24, n >> 16 & OCTET_MAX, n >> 8 & OCTET_MAX, n & OCTET_MAX].join('.');
    }

    /**
     * @param {number} n number of hosts
     * @return {number} if param isn't 0, return 32 - ceil(log2(input)), else 0
     */
    function getCidrFromHost(n) {
        return 0 !== n ? BITS_MAX - Math.ceil(Math.log(n) / Math.log(2)) : 0;
    }

    /**
     * @param {number} n CIDR or HOSTS
     * @return {number} masked of the above
     */
    function mask(n) {
        return -1 << (BITS_MAX - n);
    }

    /**
     * @param {string} submask in string notation
     * @return {number} a short int
     */
    function getCidr(submask) {
        var arr = submask.split('.');

        var i = 0,
            x = 0;
        while (i < 4) {
            x = (x << 8 | +arr[i++]) >> 0;
        }

        x -= (x >>> 1) & 0x55555555;
        x = (x & 0x33333333) + (x >>> 2 & 0x33333333);
        return ((x + (x >>> 4) & 0xF0F0F0F) * 0x1010101) >>> 24;
    }

    /**
     * @param {number} hv number of on bits
     * @return {number} number of usable hosts
     */
    function fhosts(hv) {
        hv = hv || 0; 
        return hv >= 2 ? (Math.pow(2, (BITS_MAX - hv))) - 2 : hv;
    }

    /**
     * @param {number} ip is 0th element in IPv4 address array
     * @throws throwError(); -- error func for invalid IP/submask
     * @return {string} string containing default mask
     */
    function defaultSubmask(ip) {
        if (notNum(ip)) {
            throwError(INVAL_IP);
        }

        if (ip < 128) {
            return "255.0.0.0";
        }
        if (ip < 192) {
            return "255.255.0.0";
        }
        if (ip < 224) {
            return "255.255.255.0";
        }
        if (ip < 256) {
            return "255.255.255.255";
        }

        throwError(INVAL_IP);
        return "";
    }

    /**
     * @param {number} ip is first (zero) element in array
     * @return {string} string containing class of address
     * @throws throwError(); -- error func for invalid IP/submask
     */
    function findClass(ip) {
        if (notNum(ip)) {
            throwError(INVAL_IP);
        }

        if (ip < 224) {
            if (ip < 192) {
                if (ip < 128) {
                    return "Class A"
                }
                return "Class B"
            }
            return "Class C"
        } else if (ip < 256) {
            if (ip < 240) {
                return "Class D"
            } else {
                return "Class E"
            }
        }

        throwError(INVAL_IP);
        return "";
    }

    /**
     * @param {number} ip 32-bit representation of IP address
     * @param {number} sm 32-bit representation of submask
     * @return {string} quad-dotted repr. of IPv4 address (network address)
     */
    function networkAddress(ip, sm) {
        return intToQdot(ip & sm);
    }

    /**
     * @param {number} ip 32-bit representation of IPv4 address
     * @param {number} sm 32-bit representation of submask
     * @return {string} quad-dotted repr. of IPv4 address (broadcast address)
     */
    function broadcastAddress(ip, sm) {
        return intToQdot(ip | ~sm);
    }

    /**
     * @param {number} address 32-bit int representation of a quad-dotted address
     * @return {string} hex value of address
     */
    function addressToHex(address) {
        return "0x" + address.toString(16).toUpperCase();
    }

    /**
     * @param {number} bits our 'base' var
     * @return {string} visual binary rep. of on/off bits
     */
    function onBits(bits) {
        var one = "1",
            zero = "0",
            i = "",
            v = "";

        while (i.length < bits) {
            i += one;
        }

        while (v.length < (BITS_MAX - bits)) {
            v += zero;
        }

        var binarystring = i + v;

        return binarystring.replace(/(.{8})(.{8})(.{8})/g, "$1.$2.$3.");
    }

    /**
     * @param {Array<string>} ip quad-dotted IPv4 address
     * @return {string} visual binary rep. of IPv4 address
     */
    function ipToBin(ip) {
        var binstr = "",
            seg = "",
            zero = "0";

        for (var i = 0; i < 4; i++) {
            var t = "";

            seg = (+ip[i]).toString(2)
            while (seg.length < 8) {
                seg = zero + seg;
            }

            binstr += seg;
        }

        return binstr.replace(/(.{8})(.{8})(.{8})/g, "$1.$2.$3.");
    }

    var ipBase = ipInput;
    var hosts = fhosts(base);
    var usable_hosts = 2 <= hosts ? hosts.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
    var _ip32 = qdotToInt(ipInputArray);
    var _sm32 = qdotToInt(submaskInputArray);
    var networkAddr = networkAddress(_ip32, _sm32);
    var broadcastAddr = broadcastAddress(_ip32, _sm32);
    var ipClass = findClass(+ipInputArray[0]);
    var wildcard = intToQdot(~_sm32);
    var hexAddress = addressToHex(_ip32);
    var naa = networkAddr.split('.');
    var baa = broadcastAddr.split('.');

    naa[3] = (+naa[3] + 1).toString();
    baa[3] = (+baa[3] - 1).toString();

    var netMin = naa.join('.');
    var netMax = baa.join('.');

    // CIDR
    document.getElementById("tablecidr").innerHTML = "/" + base;
    // Submask
    document.getElementById("tablesubmask").innerHTML = submask;
    // Submask -> binary
    // document.getElementById("tablebinarysub").innerHTML = onBits(base);
    // # of hosts
    document.getElementById("tablenumhosts").innerHTML = usable_hosts;
    // Wildcard mask
    // document.getElementById("tablewildcardmask").innerHTML = wildcard;
    // IP class
    document.getElementById("tableipclass").innerHTML = ipClass;
    // IP -> hex
    // document.getElementById("tableiptohex").innerHTML = hexAddress;
    // IP -> binary
    // document.getElementById("tablebinaryip").innerHTML = ipToBin(ipInputArray);
    // Network ID
    document.getElementById("tablenetworkid").innerHTML = networkAddr;
    // Broadcast Address
    document.getElementById("tablebroadcastaddress").innerHTML = broadcastAddr;
    // Network ranges
    document.getElementById("tablenetworkinicial").innerHTML = netMin;
    document.getElementById("tablenetworkfinal").innerHTML = netMax;
    // número de grupos
    var numGrupos = 256 / usable_hosts;
    numGrupos = numGrupos | 0;
    document.getElementById("tablenumgrupos").innerHTML = numGrupos;
}
window.onload = function() {
    document.getElementsByTagName("form")[0].onsubmit = function(evt) {
        evt.preventDefault();
        Calc();
        window.scrollTo(0, document.body.scrollHeight);
    };
    document.onkeypress = function keypressed(e) {
        var keyCode = (window.event) ? e.which : e.keyCode;
        if (keyCode == 13) {
            if (Calc()) {
                document.forms['calculadora'].submit();
            }
        }
    };
};
