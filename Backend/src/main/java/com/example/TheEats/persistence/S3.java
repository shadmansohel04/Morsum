package com.example.TheEats.persistence;

import java.io.InputStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.AwsCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import java.util.UUID;
import org.springframework.stereotype.Repository;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;


@Repository
public class S3 {
    
    @Autowired
    private Environment env;
    private S3Client generateClient(){
        String accessKey = env.getProperty("aws.accesskey");
        String secretKey = env.getProperty("aws.secretkey");
        AwsCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        
        S3Client client = S3Client
                .builder()
                .region(Region.of("us-east-2"))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
        
        return client;
    }
    
    public boolean deleteIMG(String objectUrl) {
        S3Client client = generateClient();
        String bucketName = env.getProperty("aws.bucket");

        if (!bucketExists(client)) {
            return false;
        }

        try {
            String key = objectUrl.substring(objectUrl.indexOf(".com/") + 5);
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();
            client.deleteObject(deleteObjectRequest);
            return true;
        } catch (Exception e) {
            System.out.println("ERR in s3: " + e.getMessage());
            return false;
        }
    }
    
    
    public String uploadIMG(MultipartFile file) throws Exception{
        S3Client client = generateClient();
        String bucketName = env.getProperty("aws.bucket");
        System.out.println(bucketName);
        if(bucketExists(client) == false){
            throw new Exception("BUCKET NO GOOD");
        }
        try{
            InputStream inputStream = file.getInputStream();
            String objectKey = UUID.randomUUID().toString() + ".webp";

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(objectKey)
                    .contentDisposition("inline")
                    .contentType("image/webp")
                    .cacheControl("public, max-age=31536000")
                    .build();
            client.putObject(putObjectRequest, RequestBody.fromInputStream(inputStream, file.getSize()));

            return objectKey;
        }
        catch(Exception e){
            System.out.println("ERR in s3");
            throw new Exception("Unable To upload");
        }
    }

    
    private boolean bucketExists(S3Client client){
        try{
            String bucket = env.getProperty("aws.bucket");
            client.headBucket(request -> request.bucket(bucket));
            System.out.println("Bucket exists and accessible!");
            return true;
        }
        catch(Exception e){
            System.out.println("Bucket existence check failed");
            return false;   
        }
    }

    
    
}
