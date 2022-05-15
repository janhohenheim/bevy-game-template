
const lAudioContext = (typeof AudioContext !== 'undefined' ? AudioContext : (typeof webkitAudioContext !== 'undefined' ? webkitAudioContext : undefined));
let wasm;

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

function getObject(idx) { return heap[idx]; }

let heap_next = heap.length;

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

const cachedTextDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
    if (cachegetUint8Memory0 === null || cachegetUint8Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = new TextEncoder('utf-8');

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length);
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len);

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3);
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
    if (cachegetInt32Memory0 === null || cachegetInt32Memory0.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory0;
}

let cachegetFloat64Memory0 = null;
function getFloat64Memory0() {
    if (cachegetFloat64Memory0 === null || cachegetFloat64Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat64Memory0 = new Float64Array(wasm.memory.buffer);
    }
    return cachegetFloat64Memory0;
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function makeMutClosure(arg0, arg1, dtor, f) {
    const state = { a: arg0, b: arg1, cnt: 1, dtor };
    const real = (...args) => {
        // First up with a closure we increment the internal reference
        // count. This ensures that the Rust closure environment won't
        // be deallocated while we're invoking it.
        state.cnt++;
        const a = state.a;
        state.a = 0;
        try {
            return f(a, state.b, ...args);
        } finally {
            if (--state.cnt === 0) {
                wasm.__wbindgen_export_2.get(state.dtor)(a, state.b);

            } else {
                state.a = a;
            }
        }
    };
    real.original = state;

    return real;
}
function __wbg_adapter_32(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h2558934a7bace2b1(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_35(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h32034ccccc935cad(arg0, arg1);
}

function __wbg_adapter_38(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h2558934a7bace2b1(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_41(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h61a59da078fa0b6d(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_44(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hab5c31b542aad718(arg0, arg1);
}

function __wbg_adapter_47(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3bd52f9934cd4292(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_50(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3bd52f9934cd4292(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_53(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3bd52f9934cd4292(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_56(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3bd52f9934cd4292(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_59(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3bd52f9934cd4292(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_62(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3bd52f9934cd4292(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_65(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3bd52f9934cd4292(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_68(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h3bd52f9934cd4292(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_71(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h1444f4bb5cfd7b12(arg0, arg1);
}

function __wbg_adapter_74(arg0, arg1) {
    wasm._dyn_core__ops__function__FnMut_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hcd568c5714cc537f(arg0, arg1);
}

function __wbg_adapter_77(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h7247b0368649c224(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_80(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h7247b0368649c224(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_83(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h625685cc9130089a(arg0, arg1, addHeapObject(arg2));
}

function __wbg_adapter_86(arg0, arg1, arg2) {
    wasm._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__he3633b653bb53171(arg0, arg1, addHeapObject(arg2));
}

function handleError(f, args) {
    try {
        return f.apply(this, args);
    } catch (e) {
        wasm.__wbindgen_exn_store(addHeapObject(e));
    }
}

function getArrayU8FromWasm0(ptr, len) {
    return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}

function notDefined(what) { return () => { throw new Error(`${what} is not defined`); }; }

let cachegetFloat32Memory0 = null;
function getFloat32Memory0() {
    if (cachegetFloat32Memory0 === null || cachegetFloat32Memory0.buffer !== wasm.memory.buffer) {
        cachegetFloat32Memory0 = new Float32Array(wasm.memory.buffer);
    }
    return cachegetFloat32Memory0;
}

function getArrayF32FromWasm0(ptr, len) {
    return getFloat32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayI32FromWasm0(ptr, len) {
    return getInt32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

let cachegetUint32Memory0 = null;
function getUint32Memory0() {
    if (cachegetUint32Memory0 === null || cachegetUint32Memory0.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory0;
}

function getArrayU32FromWasm0(ptr, len) {
    return getUint32Memory0().subarray(ptr / 4, ptr / 4 + len);
}

async function load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

async function init(input) {
    if (typeof input === 'undefined') {
        input = new URL('bevy_game-5dce3a07a4c074e5_bg.wasm', import.meta.url);
    }
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        const ret = false;
        return ret;
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        const ret = getObject(arg0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Window_0e6c0f1096d66c3c = function(arg0) {
        const ret = getObject(arg0) instanceof Window;
        return ret;
    };
    imports.wbg.__wbg_fetch_8df5fcf7dd9fd853 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).fetch(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_instanceof_Response_ccfeb62399355bcd = function(arg0) {
        const ret = getObject(arg0) instanceof Response;
        return ret;
    };
    imports.wbg.__wbg_arrayBuffer_5a99283a3954c850 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).arrayBuffer();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_cc9018bd6f283b6f = function(arg0) {
        const ret = new Uint8Array(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteSampler_d59837527a84a3a6 = function(arg0, arg1) {
        getObject(arg0).deleteSampler(getObject(arg1));
    };
    imports.wbg.__wbg_deleteQuery_00d24ac94f0a6395 = function(arg0, arg1) {
        getObject(arg0).deleteQuery(getObject(arg1));
    };
    imports.wbg.__wbg_code_2c018f346a95f33d = function(arg0) {
        const ret = getObject(arg0).code;
        return ret;
    };
    imports.wbg.__wbg_reason_0a29e5ce7c3ef62d = function(arg0, arg1) {
        const ret = getObject(arg1).reason;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_wasClean_508a6c8b4c27dadc = function(arg0) {
        const ret = getObject(arg0).wasClean;
        return ret;
    };
    imports.wbg.__wbg_send_ee9daf97107a6b95 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_createOffer_4ab31898b1accaca = function(arg0) {
        const ret = getObject(arg0).createOffer();
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_get_a9cab131e3152c49 = function() { return handleError(function (arg0, arg1) {
        const ret = Reflect.get(getObject(arg0), getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'string' ? obj : undefined;
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_new_36359baae5a47e27 = function() {
        const ret = new Object();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_set_93b1c87ee2af852e = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setLocalDescription_4108b903b7b448bb = function(arg0, arg1) {
        const ret = getObject(arg0).setLocalDescription(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_localDescription_ccd74a8ed44f37cf = function(arg0) {
        const ret = getObject(arg0).localDescription;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_sdp_e4a7ba17f5382b98 = function(arg0, arg1) {
        const ret = getObject(arg1).sdp;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_setRemoteDescription_95f2e370c6358867 = function(arg0, arg1) {
        const ret = getObject(arg0).setRemoteDescription(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_createAnswer_b24141d037f45277 = function(arg0) {
        const ret = getObject(arg0).createAnswer();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_iceGatheringState_e9b4de8940ae3c47 = function(arg0) {
        const ret = getObject(arg0).iceGatheringState;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_new_8c0a774383a8516d = function() { return handleError(function (arg0, arg1) {
        const ret = new WebSocket(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_94fb1279cf6afea5 = function() {
        const ret = new Array();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_push_40c6a90f1805aa90 = function(arg0, arg1) {
        const ret = getObject(arg0).push(getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_newwithstrsequence_cf663304dfa5d3a9 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = new WebSocket(getStringFromWasm0(arg0, arg1), getObject(arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setonopen_e0b6b5e237ac9cae = function(arg0, arg1) {
        getObject(arg0).onopen = getObject(arg1);
    };
    imports.wbg.__wbg_setonclose_31a55b52a3e598e9 = function(arg0, arg1) {
        getObject(arg0).onclose = getObject(arg1);
    };
    imports.wbg.__wbg_setonerror_a2f6dba8fc569552 = function(arg0, arg1) {
        getObject(arg0).onerror = getObject(arg1);
    };
    imports.wbg.__wbg_code_27a9bf26f5126da2 = function(arg0) {
        const ret = getObject(arg0).code;
        return ret;
    };
    imports.wbg.__wbg_setbinaryType_ef14dc8ccc5dc259 = function(arg0, arg1) {
        getObject(arg0).binaryType = takeObject(arg1);
    };
    imports.wbg.__wbg_clearTimeout_65417660fe82f08d = typeof clearTimeout == 'function' ? clearTimeout : notDefined('clearTimeout');
    imports.wbg.__wbg_new0_0ff7eb5c1486f3ec = function() {
        const ret = new Date();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getTime_bffb1c09df09618b = function(arg0) {
        const ret = getObject(arg0).getTime();
        return ret;
    };
    imports.wbg.__wbg_setonicegatheringstatechange_c312d99985ca57e2 = function(arg0, arg1) {
        getObject(arg0).onicegatheringstatechange = getObject(arg1);
    };
    imports.wbg.__wbg_close_cb79e4f9c785e64c = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).close();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_mark_abc7631bdced64f0 = function(arg0, arg1) {
        performance.mark(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_log_02e20a3c32305fb7 = function(arg0, arg1) {
        try {
            console.log(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbg_log_5c7513aa8c164502 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        try {
            console.log(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3), getStringFromWasm0(arg4, arg5), getStringFromWasm0(arg6, arg7));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbg_document_99eddbbc11ec831e = function(arg0) {
        const ret = getObject(arg0).document;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_querySelector_c03126fc82664294 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).querySelector(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_instanceof_HtmlCanvasElement_b94545433bb4d2ef = function(arg0) {
        const ret = getObject(arg0) instanceof HTMLCanvasElement;
        return ret;
    };
    imports.wbg.__wbg_width_20b7a9ebdd5f4232 = function(arg0) {
        const ret = getObject(arg0).width;
        return ret;
    };
    imports.wbg.__wbg_height_57f43816c2227a89 = function(arg0) {
        const ret = getObject(arg0).height;
        return ret;
    };
    imports.wbg.__wbg_removeEventListener_ab2f93784dae0528 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).removeEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    }, arguments) };
    imports.wbg.__wbg_error_5bd12f214e606440 = function(arg0, arg1) {
        console.error(getObject(arg0), getObject(arg1));
    };
    imports.wbg.__wbg_addEventListener_78d3aa7e06ee5b73 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3));
    }, arguments) };
    imports.wbg.__wbg_innerWidth_aebdd1c86de7b6aa = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).innerWidth;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg1);
        const ret = typeof(obj) === 'number' ? obj : undefined;
        getFloat64Memory0()[arg0 / 8 + 1] = isLikeNone(ret) ? 0 : ret;
        getInt32Memory0()[arg0 / 4 + 0] = !isLikeNone(ret);
    };
    imports.wbg.__wbg_innerHeight_67ea5ab43c3043ad = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).innerHeight;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_stopPropagation_63abc0c04280af82 = function(arg0) {
        getObject(arg0).stopPropagation();
    };
    imports.wbg.__wbg_cancelBubble_7446704fccad1780 = function(arg0) {
        const ret = getObject(arg0).cancelBubble;
        return ret;
    };
    imports.wbg.__wbg_pointerId_8b2b0e9ad7c38495 = function(arg0) {
        const ret = getObject(arg0).pointerId;
        return ret;
    };
    imports.wbg.__wbg_matches_a47fec024fc002b2 = function(arg0) {
        const ret = getObject(arg0).matches;
        return ret;
    };
    imports.wbg.__wbg_requestAnimationFrame_8e3c7028c69ebaef = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).requestAnimationFrame(getObject(arg1));
        return ret;
    }, arguments) };
    imports.wbg.__wbg_setTimeout_a100c5fd6f7b2032 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).setTimeout(getObject(arg1), arg2);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_target_46fd3a29f64b0e43 = function(arg0) {
        const ret = getObject(arg0).target;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_is_40969b082b54c84d = function(arg0, arg1) {
        const ret = Object.is(getObject(arg0), getObject(arg1));
        return ret;
    };
    imports.wbg.__wbg_getBoundingClientRect_ab935d65fdd23c25 = function(arg0) {
        const ret = getObject(arg0).getBoundingClientRect();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_clientX_83648828186ba19f = function(arg0) {
        const ret = getObject(arg0).clientX;
        return ret;
    };
    imports.wbg.__wbg_x_ef3000fe6f93272b = function(arg0) {
        const ret = getObject(arg0).x;
        return ret;
    };
    imports.wbg.__wbg_clientY_ba9e5549993281e3 = function(arg0) {
        const ret = getObject(arg0).clientY;
        return ret;
    };
    imports.wbg.__wbg_y_220956c490b84426 = function(arg0) {
        const ret = getObject(arg0).y;
        return ret;
    };
    imports.wbg.__wbg_offsetX_5888d22032ed9bd8 = function(arg0) {
        const ret = getObject(arg0).offsetX;
        return ret;
    };
    imports.wbg.__wbg_offsetY_ca0bdbbd593cafb7 = function(arg0) {
        const ret = getObject(arg0).offsetY;
        return ret;
    };
    imports.wbg.__wbg_movementX_41ae415863092c65 = function(arg0) {
        const ret = getObject(arg0).movementX;
        return ret;
    };
    imports.wbg.__wbg_movementY_22d319fd2307f93b = function(arg0) {
        const ret = getObject(arg0).movementY;
        return ret;
    };
    imports.wbg.__wbg_shiftKey_42596574095ad5e2 = function(arg0) {
        const ret = getObject(arg0).shiftKey;
        return ret;
    };
    imports.wbg.__wbg_ctrlKey_e4aeb9366ca88d41 = function(arg0) {
        const ret = getObject(arg0).ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_altKey_7b8816289b011360 = function(arg0) {
        const ret = getObject(arg0).altKey;
        return ret;
    };
    imports.wbg.__wbg_metaKey_ad377163d8beff50 = function(arg0) {
        const ret = getObject(arg0).metaKey;
        return ret;
    };
    imports.wbg.__wbg_requestFullscreen_ee477cb0bff61f4a = function() { return handleError(function (arg0) {
        getObject(arg0).requestFullscreen();
    }, arguments) };
    imports.wbg.__wbg_button_78dae8616402469e = function(arg0) {
        const ret = getObject(arg0).button;
        return ret;
    };
    imports.wbg.__wbg_buttons_f399a1bc84a54cd3 = function(arg0) {
        const ret = getObject(arg0).buttons;
        return ret;
    };
    imports.wbg.__wbg_setPointerCapture_c6fe2a502d7c4f27 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).setPointerCapture(arg1);
    }, arguments) };
    imports.wbg.__wbg_key_a8ae33ddc6ff786b = function(arg0, arg1) {
        const ret = getObject(arg1).key;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_ctrlKey_37d7587cf9229e4c = function(arg0) {
        const ret = getObject(arg0).ctrlKey;
        return ret;
    };
    imports.wbg.__wbg_altKey_4c4f9abf8a09e7c7 = function(arg0) {
        const ret = getObject(arg0).altKey;
        return ret;
    };
    imports.wbg.__wbg_getModifierState_bfe6da6a5e7b8c34 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getModifierState(getStringFromWasm0(arg1, arg2));
        return ret;
    };
    imports.wbg.__wbg_preventDefault_747982fd5fe3b6d0 = function(arg0) {
        getObject(arg0).preventDefault();
    };
    imports.wbg.__wbg_keyCode_9bdbab45f06fb085 = function(arg0) {
        const ret = getObject(arg0).keyCode;
        return ret;
    };
    imports.wbg.__wbg_charCode_6d4f547803a43cd8 = function(arg0) {
        const ret = getObject(arg0).charCode;
        return ret;
    };
    imports.wbg.__wbg_shiftKey_94c9fa9845182d9e = function(arg0) {
        const ret = getObject(arg0).shiftKey;
        return ret;
    };
    imports.wbg.__wbg_metaKey_ecd5174305b25455 = function(arg0) {
        const ret = getObject(arg0).metaKey;
        return ret;
    };
    imports.wbg.__wbg_addEventListener_be0c061a1359c1dd = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).addEventListener(getStringFromWasm0(arg1, arg2), getObject(arg3), getObject(arg4));
    }, arguments) };
    imports.wbg.__wbg_requestPointerLock_a2ffbc3e11ee2eac = function(arg0) {
        getObject(arg0).requestPointerLock();
    };
    imports.wbg.__wbg_body_2a1ff14b05042a51 = function(arg0) {
        const ret = getObject(arg0).body;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_appendChild_a86c0da8d152eae4 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).appendChild(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_new_693216e109162396 = function() {
        const ret = new Error();
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_stack_0ddaca5d1abfb52f = function(arg0, arg1) {
        const ret = getObject(arg1).stack;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_error_09919627ac0992f5 = function(arg0, arg1) {
        try {
            console.error(getStringFromWasm0(arg0, arg1));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
        }
    };
    imports.wbg.__wbg_resume_00606714ccb596ff = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).resume();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_eval_9088357f1aeaedf3 = function() { return handleError(function (arg0, arg1) {
        const ret = eval(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        const ret = typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
        return ret;
    };
    imports.wbg.__wbg_randomFillSync_654a7797990fb8db = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).randomFillSync(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_subarray_da527dbd24eafb6b = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).subarray(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getRandomValues_fb6b088efb6bead2 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).getRandomValues(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_process_70251ed1291754d5 = function(arg0) {
        const ret = getObject(arg0).process;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_object = function(arg0) {
        const val = getObject(arg0);
        const ret = typeof(val) === 'object' && val !== null;
        return ret;
    };
    imports.wbg.__wbg_versions_b23f2588cdb2ddbb = function(arg0) {
        const ret = getObject(arg0).versions;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_node_61b8c9a82499895d = function(arg0) {
        const ret = getObject(arg0).node;
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_is_string = function(arg0) {
        const ret = typeof(getObject(arg0)) === 'string';
        return ret;
    };
    imports.wbg.__wbg_static_accessor_NODE_MODULE_33b45247c55045b0 = function() {
        const ret = module;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_require_2a93bc09fee45aca = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).require(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_crypto_2f56257a38275dbd = function(arg0) {
        const ret = getObject(arg0).crypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_msCrypto_d07655bf62361f21 = function(arg0) {
        const ret = getObject(arg0).msCrypto;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithlength_8f0657faca9f1422 = function(arg0) {
        const ret = new Uint8Array(arg0 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setTimeout_131fc254e1bd5624 = function() { return handleError(function (arg0, arg1) {
        const ret = setTimeout(getObject(arg0), arg1);
        return ret;
    }, arguments) };
    imports.wbg.__wbg_getExtension_22c72750813222f6 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getExtension(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getSupportedExtensions_f7eec3b83ce8c78d = function(arg0) {
        const ret = getObject(arg0).getSupportedExtensions();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_length_2cd798326f2cc4c1 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_get_590a2cd912f2ae46 = function(arg0, arg1) {
        const ret = getObject(arg0)[arg1 >>> 0];
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getParameter_00a3d89e6e005c2f = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getParameter(arg1 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createFramebuffer_f6f4aff3c462de89 = function(arg0) {
        const ret = getObject(arg0).createFramebuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createFramebuffer_f656a97f24d2caf3 = function(arg0) {
        const ret = getObject(arg0).createFramebuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createRenderbuffer_5f8fcf55de2b35f5 = function(arg0) {
        const ret = getObject(arg0).createRenderbuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createRenderbuffer_e66ea157342e02e9 = function(arg0) {
        const ret = getObject(arg0).createRenderbuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createSampler_b7c38920b1aa08d9 = function(arg0) {
        const ret = getObject(arg0).createSampler();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createShader_8d2a55e7777bbea7 = function(arg0, arg1) {
        const ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createShader_c17c7cf4768e0737 = function(arg0, arg1) {
        const ret = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createTexture_23de5d8f7988e663 = function(arg0) {
        const ret = getObject(arg0).createTexture();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createTexture_0df375980a9c46c9 = function(arg0) {
        const ret = getObject(arg0).createTexture();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteShader_d39446753b2fa1e7 = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__wbg_deleteShader_b6480fae6d31ca67 = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__wbg_shaderSource_daca520f63ef8fca = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_shaderSource_bbfeb057b5f88df5 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).shaderSource(getObject(arg1), getStringFromWasm0(arg2, arg3));
    };
    imports.wbg.__wbg_compileShader_1b371763cfd802f7 = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__wbg_compileShader_4940032085b41ed2 = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__wbg_getShaderParameter_2972af1cb850aeb7 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getShaderParameter_87e97ffc5dc7fb05 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getShaderInfoLog_95d068aeccc5dbb3 = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getShaderInfoLog_a680dbc6e8440e5b = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getShaderInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_createProgram_c2675d2cc83435a6 = function(arg0) {
        const ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createProgram_6a25e4bb5cfaad4b = function(arg0) {
        const ret = getObject(arg0).createProgram();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteProgram_7044d91c29e31f30 = function(arg0, arg1) {
        getObject(arg0).deleteProgram(getObject(arg1));
    };
    imports.wbg.__wbg_deleteProgram_acd3f81d082ffd17 = function(arg0, arg1) {
        getObject(arg0).deleteProgram(getObject(arg1));
    };
    imports.wbg.__wbg_attachShader_0867104b37cae2d6 = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_attachShader_0994bf956cb31b2b = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__wbg_linkProgram_b98c8967f45a44fd = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__wbg_linkProgram_edd275997033948d = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__wbg_getProgramParameter_e4fe54d806806081 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getProgramParameter_4100b1077a68e2ec = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_getProgramInfoLog_e70b0120bda14895 = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getProgramInfoLog_234b1b9dbbc9282f = function(arg0, arg1, arg2) {
        const ret = getObject(arg1).getProgramInfoLog(getObject(arg2));
        var ptr0 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        var len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getActiveUniform_6e926ae8849b7b41 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_size_2821584638f68df1 = function(arg0) {
        const ret = getObject(arg0).size;
        return ret;
    };
    imports.wbg.__wbg_type_6b3d720c58da960e = function(arg0) {
        const ret = getObject(arg0).type;
        return ret;
    };
    imports.wbg.__wbg_name_b636d7dc5b7994a8 = function(arg0, arg1) {
        const ret = getObject(arg1).name;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_getActiveUniform_ee2d7b9e5794b43d = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_useProgram_022d72a653706891 = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__wbg_useProgram_039f85866d3a975b = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__wbg_createBuffer_48c0376fc0746386 = function(arg0) {
        const ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createBuffer_b6dbd62c544371ed = function(arg0) {
        const ret = getObject(arg0).createBuffer();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_bindBuffer_28e62f648e99e251 = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindBuffer_a5f37e5ebd81a1f6 = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindBufferRange_33bd5ffaaa40a5a6 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).bindBufferRange(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
    };
    imports.wbg.__wbg_bindFramebuffer_b7a06305d2823b34 = function(arg0, arg1, arg2) {
        getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindFramebuffer_6ef149f7d398d19f = function(arg0, arg1, arg2) {
        getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindRenderbuffer_0fe389ab46c4d00d = function(arg0, arg1, arg2) {
        getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindRenderbuffer_1974e9f4fdd0b3af = function(arg0, arg1, arg2) {
        getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_blitFramebuffer_c72c74d695ed2ece = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        getObject(arg0).blitFramebuffer(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0);
    };
    imports.wbg.__wbg_createVertexArrayOES_69c38b2b74e927fa = function(arg0) {
        const ret = getObject(arg0).createVertexArrayOES();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createVertexArray_d502151c473563b2 = function(arg0) {
        const ret = getObject(arg0).createVertexArray();
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_deleteVertexArray_3a1bab38b8ce3a22 = function(arg0, arg1) {
        getObject(arg0).deleteVertexArray(getObject(arg1));
    };
    imports.wbg.__wbg_deleteVertexArrayOES_7944a9952de94807 = function(arg0, arg1) {
        getObject(arg0).deleteVertexArrayOES(getObject(arg1));
    };
    imports.wbg.__wbg_bindVertexArray_dfe63bf55a9f6e54 = function(arg0, arg1) {
        getObject(arg0).bindVertexArray(getObject(arg1));
    };
    imports.wbg.__wbg_bindVertexArrayOES_35d97084dfc5f6f4 = function(arg0, arg1) {
        getObject(arg0).bindVertexArrayOES(getObject(arg1));
    };
    imports.wbg.__wbg_pixelStorei_707653d2f29a6c67 = function(arg0, arg1, arg2) {
        getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
    };
    imports.wbg.__wbg_pixelStorei_db7d39661916037c = function(arg0, arg1, arg2) {
        getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
    };
    imports.wbg.__wbg_bufferData_7bdccbfbc1a4f5c5 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__wbg_bufferData_c58bce6c13d73e02 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__wbindgen_memory = function() {
        const ret = wasm.memory;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_buffer_7af23f65f6c64548 = function(arg0) {
        const ret = getObject(arg0).buffer;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_ce1e75f0ce5f7974 = function(arg0, arg1, arg2) {
        const ret = new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_bufferData_282e5d315f5503eb = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__wbg_bufferData_8542921547008e80 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, getObject(arg2), arg3 >>> 0);
    };
    imports.wbg.__wbg_bufferSubData_884f8fcf6ab0d69e = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
    };
    imports.wbg.__wbg_bufferSubData_17fd7936ab128c56 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferSubData(arg1 >>> 0, arg2, getObject(arg3));
    };
    imports.wbg.__wbg_getBufferSubData_c211a29de38ee925 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).getBufferSubData(arg1 >>> 0, arg2, getObject(arg3));
    };
    imports.wbg.__wbg_clearBufferiv_adb545a1edf7013a = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearBufferiv(arg1 >>> 0, arg2, getArrayI32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_clearBufferuiv_a985a4810f2aff85 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearBufferuiv(arg1 >>> 0, arg2, getArrayU32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_clearBufferfv_23a50f05d21aad3f = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearBufferfv(arg1 >>> 0, arg2, getArrayF32FromWasm0(arg3, arg4));
    };
    imports.wbg.__wbg_clientWaitSync_8f7564d8e69854e9 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).clientWaitSync(getObject(arg1), arg2 >>> 0, arg3 >>> 0);
        return ret;
    };
    imports.wbg.__wbg_copyBufferSubData_2653f860bc9de094 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).copyBufferSubData(arg1 >>> 0, arg2 >>> 0, arg3, arg4, arg5);
    };
    imports.wbg.__wbg_copyTexSubImage2D_6b89ac2e1ddd3142 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        getObject(arg0).copyTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
    };
    imports.wbg.__wbg_copyTexSubImage2D_973985fdadd2db42 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        getObject(arg0).copyTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
    };
    imports.wbg.__wbg_copyTexSubImage3D_6c831053759fac49 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).copyTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9);
    };
    imports.wbg.__wbg_deleteBuffer_84d0cd43f3b572b6 = function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteBuffer_c39be892f7833f5b = function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteFramebuffer_b21de2b43d8c54e0 = function(arg0, arg1) {
        getObject(arg0).deleteFramebuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteFramebuffer_609d82d380c88142 = function(arg0, arg1) {
        getObject(arg0).deleteFramebuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteRenderbuffer_6d9875ba7b9df6c3 = function(arg0, arg1) {
        getObject(arg0).deleteRenderbuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteRenderbuffer_d12ade31b823658c = function(arg0, arg1) {
        getObject(arg0).deleteRenderbuffer(getObject(arg1));
    };
    imports.wbg.__wbg_deleteSync_7d1bce835110ac1f = function(arg0, arg1) {
        getObject(arg0).deleteSync(getObject(arg1));
    };
    imports.wbg.__wbg_deleteTexture_bf4ea3b750a15992 = function(arg0, arg1) {
        getObject(arg0).deleteTexture(getObject(arg1));
    };
    imports.wbg.__wbg_deleteTexture_8c7434cb1b20f64f = function(arg0, arg1) {
        getObject(arg0).deleteTexture(getObject(arg1));
    };
    imports.wbg.__wbg_disable_ada50e27543b1ebd = function(arg0, arg1) {
        getObject(arg0).disable(arg1 >>> 0);
    };
    imports.wbg.__wbg_disable_ec8402e41edbe277 = function(arg0, arg1) {
        getObject(arg0).disable(arg1 >>> 0);
    };
    imports.wbg.__wbg_disableVertexAttribArray_e1c513cfd55355c9 = function(arg0, arg1) {
        getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_disableVertexAttribArray_8da45bfa7fa5a02d = function(arg0, arg1) {
        getObject(arg0).disableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_drawArrays_b8da4ee5bc9599f6 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_drawArrays_ab8fc431291e5dff = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__wbg_drawArraysInstanced_921be0942a90b777 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawArraysInstanced(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_drawArraysInstancedANGLE_42dbaa04eb6eafb5 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawArraysInstancedANGLE(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        const ret = arg0;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_of_9432de44616bd927 = function(arg0) {
        const ret = Array.of(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_drawBuffersWEBGL_ec71613a6df0ca89 = function(arg0, arg1) {
        getObject(arg0).drawBuffersWEBGL(getObject(arg1));
    };
    imports.wbg.__wbg_drawBuffers_30164d7c5fd10016 = function(arg0, arg1) {
        getObject(arg0).drawBuffers(getObject(arg1));
    };
    imports.wbg.__wbg_drawElements_efa6c15e2787a58c = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
    };
    imports.wbg.__wbg_drawElements_a192faf49b4975d6 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
    };
    imports.wbg.__wbg_drawElementsInstanced_ea6a96176b3a8110 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawElementsInstanced(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__wbg_drawElementsInstancedANGLE_8ca6e0aee478b1d6 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawElementsInstancedANGLE(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__wbg_enable_981a414a11bbed87 = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__wbg_enable_51cc5ea7d16e475c = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__wbg_enableVertexAttribArray_1d5f3ff6e7da7095 = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_enableVertexAttribArray_85c507778523db86 = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__wbg_framebufferRenderbuffer_ed95c4854179b4ac = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
    };
    imports.wbg.__wbg_framebufferRenderbuffer_d73f3cb3e5a605a2 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
    };
    imports.wbg.__wbg_framebufferTexture2D_3bb72a24d7618de9 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
    };
    imports.wbg.__wbg_framebufferTexture2D_e07b69d4972eccfd = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
    };
    imports.wbg.__wbg_framebufferTextureLayer_5ead383facc27b85 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTextureLayer(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
    };
    imports.wbg.__wbg_frontFace_27420a02ba896aee = function(arg0, arg1) {
        getObject(arg0).frontFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_frontFace_89e3ad9de5432f0d = function(arg0, arg1) {
        getObject(arg0).frontFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_getParameter_f511b92ebf87c44e = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).getParameter(arg1 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getIndexedParameter_9be4debbfa0e98d5 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).getIndexedParameter(arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_getUniformLocation_776a1f58e7904d81 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_getUniformLocation_201fd94276e7dc6f = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformLocation(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_getSyncParameter_6c98bbe717c4f18c = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getSyncParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_renderbufferStorage_56e5cf7c10bbc044 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
    };
    imports.wbg.__wbg_renderbufferStorage_6ded6b343c662a60 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
    };
    imports.wbg.__wbg_renderbufferStorageMultisample_90aa1df2657b1a0a = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).renderbufferStorageMultisample(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__wbg_samplerParameterf_d09c5bed12b99776 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).samplerParameterf(getObject(arg1), arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_samplerParameteri_ad7e20195ba3a068 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).samplerParameteri(getObject(arg1), arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_texStorage2D_a1b9c11e4f891c77 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).texStorage2D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__wbg_texStorage3D_7c060bf5edbc4d83 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).texStorage3D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5, arg6);
    };
    imports.wbg.__wbg_uniform1i_42b99e992f794a51 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_uniform1i_22f9e77ed65e1503 = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__wbg_uniform4f_3064c1608d684501 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
    };
    imports.wbg.__wbg_uniform4f_5381c7867ad1318a = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).uniform4f(getObject(arg1), arg2, arg3, arg4, arg5);
    };
    imports.wbg.__wbg_cullFace_ebd111d9d3c6e6cb = function(arg0, arg1) {
        getObject(arg0).cullFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_cullFace_6f523218f401ecbb = function(arg0, arg1) {
        getObject(arg0).cullFace(arg1 >>> 0);
    };
    imports.wbg.__wbg_colorMask_0cfe7588f073be4e = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    };
    imports.wbg.__wbg_colorMask_c92354ec3511685f = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    };
    imports.wbg.__wbg_depthMask_e3ae6240c69ee7c3 = function(arg0, arg1) {
        getObject(arg0).depthMask(arg1 !== 0);
    };
    imports.wbg.__wbg_depthMask_2e8f4eeb8622dd9a = function(arg0, arg1) {
        getObject(arg0).depthMask(arg1 !== 0);
    };
    imports.wbg.__wbg_blendColor_cfd863563682d577 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_blendColor_0f4aa917df7d4cb5 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_invalidateFramebuffer_459149f09712550c = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).invalidateFramebuffer(arg1 >>> 0, getObject(arg2));
    }, arguments) };
    imports.wbg.__wbg_polygonOffset_6988d578ba78ac1f = function(arg0, arg1, arg2) {
        getObject(arg0).polygonOffset(arg1, arg2);
    };
    imports.wbg.__wbg_polygonOffset_db4c417637942873 = function(arg0, arg1, arg2) {
        getObject(arg0).polygonOffset(arg1, arg2);
    };
    imports.wbg.__wbg_bindTexture_27a724e7303eec67 = function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindTexture_dbddb0b0c3efa1b9 = function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_bindSampler_1d02b72cdccb98c7 = function(arg0, arg1, arg2) {
        getObject(arg0).bindSampler(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_activeTexture_1ba5758f0a8358b6 = function(arg0, arg1) {
        getObject(arg0).activeTexture(arg1 >>> 0);
    };
    imports.wbg.__wbg_activeTexture_eec8b0e6c72c6814 = function(arg0, arg1) {
        getObject(arg0).activeTexture(arg1 >>> 0);
    };
    imports.wbg.__wbg_fenceSync_a30c756c7278420a = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).fenceSync(arg1 >>> 0, arg2 >>> 0);
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_texParameteri_1298d8804b59bbc0 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_texParameteri_7414cf15f83e1d52 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__wbg_texSubImage2D_b26e671fcb768c49 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_f5b8e6e635a5736f = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_texSubImage2D_fe76e590b3e3fa85 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, getObject(arg9));
    }, arguments) };
    imports.wbg.__wbg_compressedTexSubImage2D_8b5da3cce00e853e = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8, arg9);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_293152433089cf24 = function(arg0, arg1, arg2) {
        const ret = new Int8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_compressedTexSubImage2D_d1972164abc1dca7 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, getObject(arg8));
    };
    imports.wbg.__wbg_compressedTexSubImage2D_29d0e2c56d65a454 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        getObject(arg0).compressedTexSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, getObject(arg8));
    };
    imports.wbg.__wbg_texSubImage3D_e15f4453401a5cb0 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
    }, arguments) };
    imports.wbg.__wbg_texSubImage3D_b80fffc939b7d64a = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, getObject(arg11));
    }, arguments) };
    imports.wbg.__wbg_compressedTexSubImage3D_5e3aabc00a092ae8 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        getObject(arg0).compressedTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10, arg11);
    };
    imports.wbg.__wbg_compressedTexSubImage3D_24b4925c4cc6adc1 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        getObject(arg0).compressedTexSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, getObject(arg10));
    };
    imports.wbg.__wbg_depthFunc_022b02671d0567ca = function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    };
    imports.wbg.__wbg_depthFunc_86631c06d99cc8b7 = function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    };
    imports.wbg.__wbg_depthRange_23a9a11ab36ef4f7 = function(arg0, arg1, arg2) {
        getObject(arg0).depthRange(arg1, arg2);
    };
    imports.wbg.__wbg_depthRange_fcefa24285a5ccf3 = function(arg0, arg1, arg2) {
        getObject(arg0).depthRange(arg1, arg2);
    };
    imports.wbg.__wbg_scissor_056d185c74d7c0ad = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).scissor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_scissor_3ea2048f24928f06 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).scissor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_vertexAttribDivisor_6cc6abefe1438a03 = function(arg0, arg1, arg2) {
        getObject(arg0).vertexAttribDivisor(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_vertexAttribDivisorANGLE_128d8966b30a77f8 = function(arg0, arg1, arg2) {
        getObject(arg0).vertexAttribDivisorANGLE(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_vertexAttribPointer_a75ea424ba9fa4e8 = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__wbg_vertexAttribPointer_4375ff065dcf90ed = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__wbg_vertexAttribIPointer_e54393825ecebdf4 = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).vertexAttribIPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__wbg_viewport_6c864379ded67e8a = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_viewport_06c29be651af660a = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__wbg_blendFunc_08a6e279418be6da = function(arg0, arg1, arg2) {
        getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_blendFunc_72335b5494b68bc1 = function(arg0, arg1, arg2) {
        getObject(arg0).blendFunc(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_blendFuncSeparate_c750720abdc9d54e = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_blendFuncSeparate_0aa8a7b4669fb810 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_blendEquation_33be7d5bece19805 = function(arg0, arg1) {
        getObject(arg0).blendEquation(arg1 >>> 0);
    };
    imports.wbg.__wbg_blendEquation_056ed0bd7ea9fa27 = function(arg0, arg1) {
        getObject(arg0).blendEquation(arg1 >>> 0);
    };
    imports.wbg.__wbg_blendEquationSeparate_ffbed0120340f7d5 = function(arg0, arg1, arg2) {
        getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_blendEquationSeparate_ccdda0657b246bb0 = function(arg0, arg1, arg2) {
        getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_stencilFuncSeparate_a67fd2aea52446dd = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).stencilFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3, arg4 >>> 0);
    };
    imports.wbg.__wbg_stencilFuncSeparate_f43489c7ac77594b = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).stencilFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3, arg4 >>> 0);
    };
    imports.wbg.__wbg_stencilMask_9ea2bf2fb1616a9b = function(arg0, arg1) {
        getObject(arg0).stencilMask(arg1 >>> 0);
    };
    imports.wbg.__wbg_stencilMask_fea8ee1f2c935ebb = function(arg0, arg1) {
        getObject(arg0).stencilMask(arg1 >>> 0);
    };
    imports.wbg.__wbg_stencilMaskSeparate_e3efaa9509ba397b = function(arg0, arg1, arg2) {
        getObject(arg0).stencilMaskSeparate(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_stencilMaskSeparate_d0d09f427805178d = function(arg0, arg1, arg2) {
        getObject(arg0).stencilMaskSeparate(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_stencilOpSeparate_a189d6338679f86f = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).stencilOpSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_stencilOpSeparate_c2d74b39ae1dc753 = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).stencilOpSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__wbg_getUniformBlockIndex_7c83171070647d86 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getUniformBlockIndex(getObject(arg1), getStringFromWasm0(arg2, arg3));
        return ret;
    };
    imports.wbg.__wbg_uniformBlockBinding_c0156a47ae6bf012 = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).uniformBlockBinding(getObject(arg1), arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_readBuffer_3dcad92784060e4c = function(arg0, arg1) {
        getObject(arg0).readBuffer(arg1 >>> 0);
    };
    imports.wbg.__wbg_readPixels_2bc3459a9d280818 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
    }, arguments) };
    imports.wbg.__wbg_readPixels_a357dbdb4f70e4c4 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, getObject(arg7));
    }, arguments) };
    imports.wbg.__wbg_readPixels_804016440beb4685 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7) {
        getObject(arg0).readPixels(arg1, arg2, arg3, arg4, arg5 >>> 0, arg6 >>> 0, arg7);
    }, arguments) };
    imports.wbg.__wbg_beginQuery_d9e264077a066b1b = function(arg0, arg1, arg2) {
        getObject(arg0).beginQuery(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__wbg_endQuery_7cb1091b756435f7 = function(arg0, arg1) {
        getObject(arg0).endQuery(arg1 >>> 0);
    };
    imports.wbg.__wbg_getQueryParameter_071fddc760c1aeb1 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).getQueryParameter(getObject(arg1), arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_20bd70cc8d50ee94 = function(arg0, arg1, arg2) {
        const ret = new Int16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_729246f395bbffc0 = function(arg0, arg1, arg2) {
        const ret = new Uint16Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_0d4e0750590b10dd = function(arg0, arg1, arg2) {
        const ret = new Int32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_bbdb045c2c009495 = function(arg0, arg1, arg2) {
        const ret = new Uint32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_3f554978d8793b14 = function(arg0, arg1, arg2) {
        const ret = new Float32Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0);
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_now_20d2aadcf3cc17f7 = function(arg0) {
        const ret = getObject(arg0).now();
        return ret;
    };
    imports.wbg.__wbindgen_debug_string = function(arg0, arg1) {
        const ret = debugString(getObject(arg1));
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_instanceof_ArrayBuffer_b81b40c2ae0ab898 = function(arg0) {
        const ret = getObject(arg0) instanceof ArrayBuffer;
        return ret;
    };
    imports.wbg.__wbg_resolve_a9a87bdd64e9e62c = function(arg0) {
        const ret = Promise.resolve(getObject(arg0));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_ce526c837d07b68f = function(arg0, arg1) {
        const ret = getObject(arg0).then(getObject(arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_then_842e65b843962f56 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0).then(getObject(arg1), getObject(arg2));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_self_99737b4dcdf6f0d8 = function() { return handleError(function () {
        const ret = self.self;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_window_9b61fbbf3564c4fb = function() { return handleError(function () {
        const ret = window.window;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_globalThis_8e275ef40caea3a3 = function() { return handleError(function () {
        const ret = globalThis.globalThis;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_global_5de1e0f82bddcd27 = function() { return handleError(function () {
        const ret = global.global;
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_is_undefined = function(arg0) {
        const ret = getObject(arg0) === undefined;
        return ret;
    };
    imports.wbg.__wbg_newnoargs_e23b458e372830de = function(arg0, arg1) {
        const ret = new Function(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_call_ae78342adc33730a = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).call(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_length_0acb1cf9bbaf8519 = function(arg0) {
        const ret = getObject(arg0).length;
        return ret;
    };
    imports.wbg.__wbg_set_f25e869e4565d2a2 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__wbg_currentTime_510dde7d31c119e8 = function(arg0) {
        const ret = getObject(arg0).currentTime;
        return ret;
    };
    imports.wbg.__wbg_copyToChannel_4f2e7d757aea797a = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        getObject(arg0).copyToChannel(getArrayF32FromWasm0(arg1, arg2), arg3);
    }, arguments) };
    imports.wbg.__wbg_createBufferSource_414d1e25fd67f353 = function() { return handleError(function (arg0) {
        const ret = getObject(arg0).createBufferSource();
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setbuffer_72cfecac4d22725d = function(arg0, arg1) {
        getObject(arg0).buffer = getObject(arg1);
    };
    imports.wbg.__wbg_destination_f4f5ac55ff6e3785 = function(arg0) {
        const ret = getObject(arg0).destination;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_connect_7fe7ce5856f531e9 = function() { return handleError(function (arg0, arg1) {
        const ret = getObject(arg0).connect(getObject(arg1));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_setonended_f22c38d46d048b5e = function(arg0, arg1) {
        getObject(arg0).onended = getObject(arg1);
    };
    imports.wbg.__wbg_start_a0eb9df7289c5c06 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).start(arg1);
    }, arguments) };
    imports.wbg.__wbg_newwithcontextoptions_306dddcebb669c90 = function() { return handleError(function (arg0) {
        const ret = new lAudioContext(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createBuffer_19d3c1651316a6c2 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).createBuffer(arg1 >>> 0, arg2 >>> 0, arg3);
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbindgen_json_parse = function(arg0, arg1) {
        const ret = JSON.parse(getStringFromWasm0(arg0, arg1));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_newwithconfiguration_9391f5ab68b83330 = function() { return handleError(function (arg0) {
        const ret = new RTCPeerConnection(getObject(arg0));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_createDataChannel_1aa9362f0cb40a01 = function(arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).createDataChannel(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_setbinaryType_958a3692ca871415 = function(arg0, arg1) {
        getObject(arg0).binaryType = takeObject(arg1);
    };
    imports.wbg.__wbg_setonmessage_85730fcefa6359d1 = function(arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    };
    imports.wbg.__wbg_setonopen_d8a9b37cafaea011 = function(arg0, arg1) {
        getObject(arg0).onopen = getObject(arg1);
    };
    imports.wbg.__wbg_data_9ccfa9ae4eb71e78 = function(arg0) {
        const ret = getObject(arg0).data;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_measure_c528ff64085b7146 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        try {
            performance.measure(getStringFromWasm0(arg0, arg1), getStringFromWasm0(arg2, arg3));
        } finally {
            wasm.__wbindgen_free(arg0, arg1);
            wasm.__wbindgen_free(arg2, arg3);
        }
    }, arguments) };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };
    imports.wbg.__wbg_instanceof_Blob_ed855ca1ab1ac657 = function(arg0) {
        const ret = getObject(arg0) instanceof Blob;
        return ret;
    };
    imports.wbg.__wbg_setProperty_ae9adf5d00216c03 = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setProperty(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_fullscreenElement_44802e654491d657 = function(arg0) {
        const ret = getObject(arg0).fullscreenElement;
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_createElement_3c9b5f3aa42457a1 = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).createElement(getStringFromWasm0(arg1, arg2));
        return addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_exitFullscreen_e9ac392f4dfc0de0 = function(arg0) {
        getObject(arg0).exitFullscreen();
    };
    imports.wbg.__wbg_exitPointerLock_73d419d8d307f452 = function(arg0) {
        getObject(arg0).exitPointerLock();
    };
    imports.wbg.__wbg_setAttribute_8d90e00d652037be = function() { return handleError(function (arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).setAttribute(getStringFromWasm0(arg1, arg2), getStringFromWasm0(arg3, arg4));
    }, arguments) };
    imports.wbg.__wbg_setwidth_654d8adcd4979eed = function(arg0, arg1) {
        getObject(arg0).width = arg1 >>> 0;
    };
    imports.wbg.__wbg_setheight_2b662384bfacb65c = function(arg0, arg1) {
        getObject(arg0).height = arg1 >>> 0;
    };
    imports.wbg.__wbg_getContext_d7d734e1c1199dd1 = function() { return handleError(function (arg0, arg1, arg2, arg3) {
        const ret = getObject(arg0).getContext(getStringFromWasm0(arg1, arg2), getObject(arg3));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_style_dd3ba68ea919f1b0 = function(arg0) {
        const ret = getObject(arg0).style;
        return addHeapObject(ret);
    };
    imports.wbg.__wbg_code_a637bfca56413948 = function(arg0, arg1) {
        const ret = getObject(arg1).code;
        const ptr0 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len0 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len0;
        getInt32Memory0()[arg0 / 4 + 0] = ptr0;
    };
    imports.wbg.__wbg_matches_7809d58d7a13e2eb = function(arg0) {
        const ret = getObject(arg0).matches;
        return ret;
    };
    imports.wbg.__wbg_addListener_656a78e6ab0aed8e = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).addListener(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_removeListener_e53a15f9ce1ac7cd = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).removeListener(getObject(arg1));
    }, arguments) };
    imports.wbg.__wbg_instanceof_WebGl2RenderingContext_e29e70ae6c00bfdd = function(arg0) {
        const ret = getObject(arg0) instanceof WebGL2RenderingContext;
        return ret;
    };
    imports.wbg.__wbg_readyState_f605e22ee9a26ed3 = function(arg0) {
        const ret = getObject(arg0).readyState;
        return ret;
    };
    imports.wbg.__wbg_setonmessage_d46b8d7fbb11b2f1 = function(arg0, arg1) {
        getObject(arg0).onmessage = getObject(arg1);
    };
    imports.wbg.__wbg_close_ca991bb1a9bd1765 = function() { return handleError(function (arg0) {
        getObject(arg0).close();
    }, arguments) };
    imports.wbg.__wbg_send_17ffe30ae8fb4adb = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getStringFromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_send_fab1676b84aa5840 = function() { return handleError(function (arg0, arg1, arg2) {
        getObject(arg0).send(getArrayU8FromWasm0(arg1, arg2));
    }, arguments) };
    imports.wbg.__wbg_deltaX_692299f5e35cfb0d = function(arg0) {
        const ret = getObject(arg0).deltaX;
        return ret;
    };
    imports.wbg.__wbg_deltaY_f78bae9413139a24 = function(arg0) {
        const ret = getObject(arg0).deltaY;
        return ret;
    };
    imports.wbg.__wbg_deltaMode_08c2fcea70146506 = function(arg0) {
        const ret = getObject(arg0).deltaMode;
        return ret;
    };
    imports.wbg.__wbg_devicePixelRatio_cac0b66c0e1e056b = function(arg0) {
        const ret = getObject(arg0).devicePixelRatio;
        return ret;
    };
    imports.wbg.__wbg_cancelAnimationFrame_7a4ff0365b95acb4 = function() { return handleError(function (arg0, arg1) {
        getObject(arg0).cancelAnimationFrame(arg1);
    }, arguments) };
    imports.wbg.__wbg_matchMedia_7a04497c9cd2fc1e = function() { return handleError(function (arg0, arg1, arg2) {
        const ret = getObject(arg0).matchMedia(getStringFromWasm0(arg1, arg2));
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    }, arguments) };
    imports.wbg.__wbg_get_1a5d33bebaa9ec33 = function(arg0, arg1, arg2) {
        const ret = getObject(arg0)[getStringFromWasm0(arg1, arg2)];
        return isLikeNone(ret) ? 0 : addHeapObject(ret);
    };
    imports.wbg.__wbg_clearTimeout_7d8e22408e148ffd = function(arg0, arg1) {
        getObject(arg0).clearTimeout(arg1);
    };
    imports.wbg.__wbindgen_closure_wrapper2292 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1347, __wbg_adapter_32);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper2294 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1347, __wbg_adapter_35);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper2296 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 1347, __wbg_adapter_38);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper13933 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10263, __wbg_adapter_41);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper14231 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10502, __wbg_adapter_44);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper14233 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10502, __wbg_adapter_47);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper14235 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10502, __wbg_adapter_50);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper14237 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10502, __wbg_adapter_53);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper14239 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10502, __wbg_adapter_56);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper14241 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10502, __wbg_adapter_59);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper14243 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10502, __wbg_adapter_62);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper14245 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10502, __wbg_adapter_65);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper14247 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10502, __wbg_adapter_68);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper14766 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10718, __wbg_adapter_71);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper15784 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10877, __wbg_adapter_74);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper16021 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10942, __wbg_adapter_77);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper16023 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 10942, __wbg_adapter_80);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper18316 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 11737, __wbg_adapter_83);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_closure_wrapper20707 = function(arg0, arg1, arg2) {
        const ret = makeMutClosure(arg0, arg1, 12317, __wbg_adapter_86);
        return addHeapObject(ret);
    };

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }



    const { instance, module } = await load(await input, imports);

    wasm = instance.exports;
    init.__wbindgen_wasm_module = module;
    wasm.__wbindgen_start();
    return wasm;
}

export default init;

