package backend.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import backend.model.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    //Esta clase contiene la lógica de los tokens

    //Creacion, validación , extracción de datos:

    @Value("${jwt.secret}")  //Value inyecta un valor proveniente de un archivo de configuración 
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generarToken(Usuario usuario) {
        return Jwts.builder()
                .setSubject(usuario.getCorreo())
                //Claim añade campos extra al payload
                .claim("idUsuarios", usuario.getIdUsuarios())
                .claim("nombre", usuario.getNombreUsuarios())
                //Añadir fecha de creacion del token
                .setIssuedAt(new Date())  //pone fecha 
                //Define la fecha de expiración del token (ms)
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                //Se firma el token
                .signWith(getKey(), SignatureAlgorithm.HS256)  //Hs256 -> HMAC + SHA-256
                .compact();  //Concatena todo y finaliza la creación del token
    }

    public String extraerCorreo(String token) {
        return parseClaims(token).getSubject();
    }

    public Integer extraerIdUsuario(String token) {
        return parseClaims(token).get("idUsuarios", Integer.class);
    }
    //Método para verificar la integridad del token o su caducidad
    public boolean esValido(String token) {
        try {
            //Con solo este metodo se decodifica y evalua la firma
            //todo mediante la clave secreta
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
    //Método raro que me dijo la ia que sirve para validar la firma del token
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}