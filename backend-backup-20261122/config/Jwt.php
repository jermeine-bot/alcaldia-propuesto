<?php

namespace Config;

class Jwt {
    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', 3 - (3 + strlen($data)) % 4));
    }

    public static function sign(array $payload, string $secret, int $expiresInSeconds = 604800): string {
        $header = ['typ' => 'JWT', 'alg' => 'HS256'];
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiresInSeconds;

        $encodedHeader = self::base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES));
        $encodedPayload = self::base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES));

        $signature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
        $encodedSignature = self::base64UrlEncode($signature);

        return "{$encodedHeader}.{$encodedPayload}.{$encodedSignature}";
    }

    public static function verify(string $token, string $secret): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$encodedHeader, $encodedPayload, $encodedSignature] = $parts;

        $expectedSignature = hash_hmac('sha256', "{$encodedHeader}.{$encodedPayload}", $secret, true);
        $encodedExpectedSignature = self::base64UrlEncode($expectedSignature);

        if (!hash_equals($encodedExpectedSignature, $encodedSignature)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($encodedPayload), true);
        if (!is_array($payload)) {
            return null;
        }

        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return null; // Expirado
        }

        return $payload;
    }
}
