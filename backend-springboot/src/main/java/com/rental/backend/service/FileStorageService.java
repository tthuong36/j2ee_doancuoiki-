package com.rental.backend.service;

import com.rental.backend.exception.ApiException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    @Value("${app.upload.base-dir}")
    private String uploadBaseDir;

    public String storeAvatar(MultipartFile file, String baseUrl) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        String filename = save(file, "avatars");
        return baseUrl + "/uploads/avatars/" + filename;
    }

    public List<String> storeCarImages(List<MultipartFile> files, String baseUrl) {
        List<String> urls = new ArrayList<>();
        if (files == null || files.isEmpty()) {
            return urls;
        }

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            String filename = save(file, "cars");
            urls.add(baseUrl + "/uploads/cars/" + filename);
        }
        return urls;
    }

    private String save(MultipartFile file, String folder) {
        try {
            Path dir = Paths.get(uploadBaseDir, folder).toAbsolutePath().normalize();
            Files.createDirectories(dir);

            String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
            String filename = UUID.randomUUID() + (ext != null ? "." + ext : "");
            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (IOException ex) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Cannot store file");
        }
    }
}
