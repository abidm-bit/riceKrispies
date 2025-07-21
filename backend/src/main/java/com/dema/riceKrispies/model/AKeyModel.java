package com.dema.riceKrispies.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "all_Keys")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AKeyModel {
    @Id
    @Column(unique = true, nullable = false)
    private String key;

    @Column(nullable = false)
    private boolean burned = false;

    @Column(name = "burned_by")
    private Integer burnedBy;
} 