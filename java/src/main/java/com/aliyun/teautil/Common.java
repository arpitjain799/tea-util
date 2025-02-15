package com.aliyun.teautil;

import com.aliyun.tea.TeaModel;
import com.aliyun.tea.utils.StringUtils;
import com.aliyun.teautil.models.TeaUtilException;
import com.google.gson.*;
import com.google.gson.reflect.TypeToken;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Type;
import java.net.URLEncoder;
import java.text.SimpleDateFormat;
import java.util.*;

public class Common {

    private static final String defaultUserAgent;

    static {
        Properties sysProps = System.getProperties();
        defaultUserAgent = String.format("AlibabaCloud (%s; %s) Java/%s %s/%s TeaDSL/1", sysProps.getProperty("os.name"), sysProps
                .getProperty("os.arch"), sysProps.getProperty("java.runtime.version"), "tea-util", JavaProject.teaUtilVersion);
    }

    /**
     * Convert a string(utf8) to bytes
     *
     * @return the return bytes
     */
    public static byte[] toBytes(String str) {
        try {
            return str.getBytes("UTF-8");
        } catch (UnsupportedEncodingException e) {
            throw new TeaUtilException(e.getMessage(), e);
        }
    }

    /**
     * Convert a bytes to string(utf8)
     *
     * @return the return string
     */
    public static String toString(byte[] bytes) {
        try {
            return new String(bytes, "UTF-8");
        } catch (UnsupportedEncodingException e) {
            throw new TeaUtilException(e.getMessage(), e);
        }
    }

    /**
     * Parse it by JSON format
     *
     * @return the parsed result
     */
    public static Object parseJSON(String json) {
        Gson gson = new GsonBuilder()
                .registerTypeAdapter(new TypeToken<Map<String, Object>>() {
                }.getType(), new MapTypeAdapter()).create();

        JsonElement jsonElement = gson.fromJson(json, JsonElement.class);
        return jsonElement.isJsonArray() ? gson.fromJson(json, List.class) :
                gson.fromJson(json, new TypeToken<Map<String, Object>>() {
                }.getType());
    }

    /**
     * Assert a value, if it is a map,  it, otherwise throws
     *
     * @return the map value
     */
    public static Map<String, Object> assertAsMap(Object object) {
        if (null != object && Map.class.isAssignableFrom(object.getClass())) {
            return (Map<String, Object>) object;
        }
        throw new TeaUtilException("The value is not a object");
    }

    /**
     * Assert a value, if it is a array, return it, otherwise throws
     *
     * @return the array
     */
    public static List<Object> assertAsArray(Object object) {
        if (null != object && List.class.isAssignableFrom(object.getClass())) {
            return (List<Object>) object;
        }
        throw new TeaUtilException("The value is not a array");
    }

    /**
     * Assert a value, if it is a readable, return it, otherwise throws
     *
     * @return the readable value
     */
    public static InputStream assertAsReadable(Object value) {
        if (null != value && InputStream.class.isAssignableFrom(value.getClass())) {
            return (InputStream) value;
        }
        throw new TeaUtilException("The value is not a readable");
    }

    /**
     * Assert a value, if it is a bytes, return it, otherwise throws
     *
     * @return the bytes value
     */
    public static byte[] assertAsBytes(Object object) {
        if (object instanceof byte[]) {
            return (byte[]) object;
        }
        throw new TeaUtilException("The value is not a byteArray");
    }

    /**
     * Assert a value, if it is a number, return it, otherwise throws
     *
     * @return the number value
     */
    public static Number assertAsNumber(Object object) {
        if (object instanceof Number) {
            return (Number) object;
        }
        throw new TeaUtilException("The value is not a Number");
    }

    /**
     * Assert a value, if it is a string, return it, otherwise throws
     *
     * @return the string value
     */
    public static String assertAsString(Object object) {
        if (object instanceof String) {
            return (String) object;
        }
        throw new TeaUtilException("The value is not a String");
    }

    /**
     * Assert a value, if it is a boolean, return it, otherwise throws
     *
     * @return the boolean value
     */
    public static Boolean assertAsBoolean(Object object) {
        try {
            return (Boolean) object;
        } catch (Exception e) {
            throw new TeaUtilException("The value is not a Boolean");
        }
    }

    /**
     * Read data from a readable stream, and compose it to a bytes
     *
     * @param stream the readable stream
     * @return the bytes result
     */
    public static byte[] readAsBytes(InputStream stream) {
        try {
            if (null == stream) {
                return new byte[]{};
            } else {
                ByteArrayOutputStream os = new ByteArrayOutputStream();
                byte[] buff = new byte[1024];
                while (true) {
                    int read = stream.read(buff);
                    if (read == -1) {
                        return os.toByteArray();
                    }
                    os.write(buff, 0, read);
                }
            }
        } catch (Exception e) {
            throw new TeaUtilException(e.getMessage(), e);
        } finally {
            if (null != stream) {
                try {
                    stream.close();
                } catch (IOException e) {
                    throw new TeaUtilException(e.getMessage(), e);
                }
            }
        }
    }

    /**
     * Read data from a readable stream, and compose it to a string
     *
     * @param stream the readable stream
     * @return the string result
     */
    public static String readAsString(InputStream stream) {
        try {
            return new String(readAsBytes(stream), "UTF-8");
        } catch (UnsupportedEncodingException e) {
            throw new TeaUtilException(e.getMessage(), e);
        }
    }

    /**
     * Read data from a readable stream, and parse it by JSON format
     *
     * @param stream the readable stream
     * @return the parsed result
     */
    public static Object readAsJSON(InputStream stream) {
        String body = readAsString(stream);
        try {
            return parseJSON(body);
        } catch (Exception exception) {
            throw new TeaUtilException("Error: convert to JSON, response is:\n" + body);
        }
    }

    /**
     * Generate a nonce string
     *
     * @return the nonce string
     */
    public static String getNonce() {
        StringBuffer uniqueNonce = new StringBuffer();
        UUID uuid = UUID.randomUUID();
        uniqueNonce.append(uuid.toString());
        uniqueNonce.append(System.currentTimeMillis());
        uniqueNonce.append(Thread.currentThread().getId());
        return uniqueNonce.toString();
    }

    /**
     * Get an UTC format string by current date, e.g. 'Thu, 06 Feb 2020 07:32:54 GMT'
     *
     * @return the UTC format string
     */
    public static String getDateUTCString() {
        SimpleDateFormat df = new SimpleDateFormat("EEE, dd MMM yyyy HH:mm:ss z", Locale.US);
        df.setTimeZone(new SimpleTimeZone(0, "GMT"));
        return df.format(new Date());
    }

    /**
     * If not set the real, use default value
     *
     * @return the return string
     */
    public static String defaultString(String str, String defaultStr) {
        if (!StringUtils.isEmpty(str)) {
            return str;
        }
        return defaultStr;
    }

    /**
     * If not set the real, use default value
     *
     * @return the return string
     */
    public static Number defaultNumber(Number number, Number defaultNumber) {
        if (number != null && number.doubleValue() >= 0) {
            return number;
        }
        return defaultNumber;
    }

    /**
     * Format a map to form string, like a=a%20b%20c
     *
     * @return the form string
     */
    public static String toFormString(Map<String, ?> map) {
        if (null == map) {
            return "";
        }
        StringBuilder result = new StringBuilder();
        boolean first = true;
        try {
            for (Map.Entry<String, ?> entry : map.entrySet()) {
                if (StringUtils.isEmpty(entry.getValue())) {
                    continue;
                }
                if (first) {
                    first = false;
                } else {
                    result.append("&");
                }
                result.append(URLEncoder.encode(entry.getKey(), "UTF-8"));
                result.append("=");
                result.append(URLEncoder.encode(String.valueOf(entry.getValue()), "UTF-8"));
            }
        } catch (Exception e) {
            throw new TeaUtilException(e.getMessage(), e);
        }
        return result.toString();
    }

    /**
     * If not set the real, use default value
     *
     * @return the return string
     */
    public static String toJSONString(Object object) {
        if (object instanceof String) {
            return (String) object;
        }
        Gson gson = new GsonBuilder().disableHtmlEscaping().create();
        return gson.toJson(object);
    }

    /**
     * Check the string is empty?
     *
     * @return if string is null or zero length, return true
     */
    public static boolean empty(String str) {
        return StringUtils.isEmpty(str);
    }

    /**
     * Check one string equals another one?
     *
     * @return if equals, return true
     */
    public static boolean equalString(String str, String val) {
        if (str == null || val == null) {
            return false;
        }
        return str.equals(val);
    }

    /**
     * Check one number equals another one?
     *
     * @return if equals, return true
     */
    public static boolean equalNumber(Number num, Number val) {
        if (num == null || val == null) {
            return false;
        }
        return num.doubleValue() == val.doubleValue();
    }

    /**
     * Check one value is unset
     *
     * @return if unset, return true
     */
    public static boolean isUnset(Object object) {
        return null == object;
    }

    /**
     * Stringify the value of map
     *
     * @return the new stringified map
     */
    public static Map<String, String> stringifyMapValue(Map<String, ?> map) {
        Map<String, String> result = new HashMap<>();
        if (null == map) {
            return null;
        }
        for (Map.Entry<String, ?> entry : map.entrySet()) {
            if (null == entry.getValue()) {
                continue;
            }
            result.put(entry.getKey(), String.valueOf(entry.getValue()));
        }
        return result;
    }

    /**
     * Anyify the value of map
     *
     * @return the new anyfied map
     */
    public static Map<String, Object> anyifyMapValue(Map<String, ?> map) {
        Map<String, Object> result = new HashMap<>();
        if (null == map) {
            return null;
        }
        for (Map.Entry<String, ?> entry : map.entrySet()) {
            result.put(entry.getKey(), entry.getValue());
        }
        return result;
    }


    /**
     * Get user agent, if it userAgent is not null, splice it with defaultUserAgent and return, otherwise return defaultUserAgent
     *
     * @return the string value
     */
    public static String getUserAgent(String val) {
        if (StringUtils.isEmpty(val)) {
            return defaultUserAgent;
        }
        return defaultUserAgent + " " + val;
    }

    /**
     * If the code between 200 and 300, return true, or return false
     *
     * @return boolean
     */
    public static boolean is2xx(Number code) {
        if (null == code) {
            return false;
        }
        return code.intValue() >= 200 && code.intValue() < 300 ? true : false;
    }

    /**
     * If the code between 300 and 400, return true, or return false
     *
     * @return boolean
     */
    public static boolean is3xx(Number code) {
        if (null == code) {
            return false;
        }
        return code.intValue() >= 300 && code.intValue() < 400 ? true : false;
    }

    /**
     * If the code between 400 and 500, return true, or return false
     *
     * @return boolean
     */
    public static boolean is4xx(Number code) {
        if (null == code) {
            return false;
        }
        return code.intValue() >= 400 && code.intValue() < 500 ? true : false;
    }

    /**
     * If the code between 500 and 600, return true, or return false
     *
     * @return boolean
     */
    public static boolean is5xx(Number code) {
        if (null == code) {
            return false;
        }
        return code.intValue() >= 500 && code.intValue() < 600 ? true : false;
    }

    /**
     * Validate model
     *
     * @return void
     */
    public static void validateModel(TeaModel m) {
        if (null == m) {
            throw new TeaUtilException("parameter is not allowed as null");
        }
        try {
            m.validate();
        } catch (Exception e) {
            throw new TeaUtilException(e.getMessage(), e);
        }
    }

    /**
     * Model transforms to map[string]any
     *
     * @return map[string]any
     */
    public static java.util.Map<String, Object> toMap(TeaModel in) {
        try {
            return TeaModel.toMap(in);
        } catch (Exception e) {
            throw new TeaUtilException(e.getMessage(), e);
        }
    }

    /**
     * Suspends the current thread for the specified number of milliseconds.
     */
    public static void sleep(int millisecond) {
        try {
            Thread.sleep(millisecond);
        } catch (InterruptedException e) {
            throw new TeaUtilException(e.getMessage(), e);
        }
    }

    /**
     * Transform input as array.
     */
    public static List<Map<String, Object>> toArray(Object input) {
        if (null == input) {
            return null;
        }
        try {
            List<TeaModel> teaModels = (List<TeaModel>) input;
            List<Map<String, Object>> result = new ArrayList<>();
            for (TeaModel teaModel : teaModels) {
                if (null == teaModel) {
                    continue;
                }
                result.add(teaModel.toMap());
            }
            return result;
        } catch (Exception e) {
            return null;
        }
    }
}

