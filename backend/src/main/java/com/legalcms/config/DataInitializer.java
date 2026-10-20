package com.legalcms.config;

import com.legalcms.entity.*;
import com.legalcms.enums.RoleCode;
import com.legalcms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;

import java.util.Arrays;
import java.util.Set;

@Slf4j
@Component
@Profile("!prod")
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    private final RoleRepository roleRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final AdvocateRepository advocateRepository;
    private final CourtRepository courtRepository;
    private final FeeCategoryRepository feeCategoryRepository;
    private final FeeRuleRepository feeRuleRepository;
    private final WorkflowDefinitionRepository workflowDefinitionRepository;
    private final WorkflowStageRepository workflowStageRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("System seed data initialization is disabled via app.seed.enabled=false");
            return;
        }
        log.info("Initializing system seed data for non-production environment...");

        // 1. Seed Roles
        for (RoleCode roleCode : RoleCode.values()) {
            if (roleRepository.findByCode(roleCode).isEmpty()) {
                roleRepository.save(Role.builder()
                        .code(roleCode)
                        .name(roleCode.name().replace('_', ' '))
                        .build());
            }
        }

        // 2. Seed Departments
        Department legalDept = departmentRepository.findByCode("LEGAL_DEPT")
                .orElseGet(() -> departmentRepository.save(Department.builder()
                        .code("LEGAL_DEPT")
                        .name("Legal Department, Government of Gujarat")
                        .active(true)
                        .build()));

        if (departmentRepository.findByCode("REV_DEPT").isEmpty()) {
            departmentRepository.save(Department.builder()
                    .code("REV_DEPT")
                    .name("Revenue Department, Government of Gujarat")
                    .active(true)
                    .build());
        }

        // 3. Seed Courts
        if (courtRepository.count() == 0) {
            courtRepository.save(Court.builder().name("High Court of Gujarat").level("HIGH_COURT").location("Ahmedabad").active(true).build());
            courtRepository.save(Court.builder().name("City Civil & Sessions Court, Ahmedabad").level("DISTRICT_COURT").location("Ahmedabad").active(true).build());
            courtRepository.save(Court.builder().name("District & Sessions Court, Gandhinagar").level("DISTRICT_COURT").location("Gandhinagar").active(true).build());
            courtRepository.save(Court.builder().name("Supreme Court of India").level("SUPREME_COURT").location("New Delhi").active(true).build());
        }

        // 4. Seed Fee Categories and Rules
        if (feeCategoryRepository.count() == 0) {
            FeeCategory catAppearance = feeCategoryRepository.save(FeeCategory.builder()
                    .code("HC_APPEARANCE")
                    .label("High Court Effective Appearance")
                    .active(true)
                    .build());

            FeeCategory catDrafting = feeCategoryRepository.save(FeeCategory.builder()
                    .code("DRAFTING_PETITION")
                    .label("Drafting Special Civil Application")
                    .active(true)
                    .build());

            feeRuleRepository.save(FeeRule.builder()
                    .category(catAppearance)
                    .ruleType("PER_HEARING")
                    .rate(new BigDecimal("7500.00"))
                    .effectiveFrom(LocalDate.of(2024, 1, 1))
                    .requiresHearing(true)
                    .requiredDocuments("ATTENDANCE_MEMO,DAILY_ORDER")
                    .build());

            feeRuleRepository.save(FeeRule.builder()
                    .category(catDrafting)
                    .ruleType("PER_DOCUMENT")
                    .rate(new BigDecimal("5000.00"))
                    .effectiveFrom(LocalDate.of(2024, 1, 1))
                    .requiresHearing(false)
                    .requiredDocuments("PETITION_COPY")
                    .build());
        }

        // 5. Seed Workflow Definition & Stages
        WorkflowDefinition workflow = workflowDefinitionRepository.findByWorkflowCodeAndActiveTrue("STANDARD_BILL_FLOW")
                .orElseGet(() -> workflowDefinitionRepository.save(WorkflowDefinition.builder()
                        .workflowCode("STANDARD_BILL_FLOW")
                        .version(1)
                        .active(true)
                        .build()));

        if (workflowStageRepository.count() == 0) {
            workflowStageRepository.save(WorkflowStage.builder()
                    .workflow(workflow)
                    .stageOrder(1)
                    .roleCode(RoleCode.VERIFIER)
                    .dueHours(48)
                    .authorityLimit(new BigDecimal("50000.00"))
                    .build());

            workflowStageRepository.save(WorkflowStage.builder()
                    .workflow(workflow)
                    .stageOrder(2)
                    .roleCode(RoleCode.APPROVER)
                    .dueHours(48)
                    .authorityLimit(new BigDecimal("200000.00"))
                    .build());

            workflowStageRepository.save(WorkflowStage.builder()
                    .workflow(workflow)
                    .stageOrder(3)
                    .roleCode(RoleCode.DEPARTMENT_HEAD)
                    .dueHours(72)
                    .authorityLimit(null)
                    .build());
        }

        // 6. Seed Users
        Role adminRole = roleRepository.findByCode(RoleCode.ADMIN).orElseThrow();
        Role advocateRole = roleRepository.findByCode(RoleCode.ADVOCATE).orElseThrow();
        Role verifierRole = roleRepository.findByCode(RoleCode.VERIFIER).orElseThrow();
        Role approverRole = roleRepository.findByCode(RoleCode.APPROVER).orElseThrow();
        Role deptHeadRole = roleRepository.findByCode(RoleCode.DEPARTMENT_HEAD).orElseThrow();
        Role legalOfficerRole = roleRepository.findByCode(RoleCode.LEGAL_OFFICER).orElseThrow();
        Role financeOfficerRole = roleRepository.findByCode(RoleCode.FINANCE_OFFICER).orElseThrow();

        // Admin User
        if (userRepository.findByLogin("admin").isEmpty()) {
            userRepository.save(User.builder()
                    .name("System Administrator")
                    .login("admin")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .department(legalDept)
                    .active(true)
                    .roles(Set.of(adminRole))
                    .build());
        }

        // Verifier User
        if (userRepository.findByLogin("verifier1").isEmpty()) {
            userRepository.save(User.builder()
                    .name("Vikas Patel (Verifier)")
                    .login("verifier1")
                    .passwordHash(passwordEncoder.encode("Verifier@123"))
                    .department(legalDept)
                    .active(true)
                    .roles(Set.of(verifierRole))
                    .build());
        }

        // Approver User
        if (userRepository.findByLogin("approver1").isEmpty()) {
            userRepository.save(User.builder()
                    .name("Anjali Sharma (Approver)")
                    .login("approver1")
                    .passwordHash(passwordEncoder.encode("Approver@123"))
                    .department(legalDept)
                    .active(true)
                    .roles(Set.of(approverRole))
                    .build());
        }

        // Dept Head
        if (userRepository.findByLogin("depthead1").isEmpty()) {
            userRepository.save(User.builder()
                    .name("Rajesh Mehta (Department Head)")
                    .login("depthead1")
                    .passwordHash(passwordEncoder.encode("DeptHead@123"))
                    .department(legalDept)
                    .active(true)
                    .roles(Set.of(deptHeadRole))
                    .build());
        }

        // Legal Officer
        if (userRepository.findByLogin("legalofficer1").isEmpty()) {
            userRepository.save(User.builder()
                    .name("Pooja Desai (Legal Officer)")
                    .login("legalofficer1")
                    .passwordHash(passwordEncoder.encode("Legal@123"))
                    .department(legalDept)
                    .active(true)
                    .roles(Set.of(legalOfficerRole))
                    .build());
        }

        // Finance Officer
        if (userRepository.findByLogin("finance1").isEmpty()) {
            userRepository.save(User.builder()
                    .name("Kirit Dave (Finance Officer)")
                    .login("finance1")
                    .passwordHash(passwordEncoder.encode("Finance@123"))
                    .department(legalDept)
                    .active(true)
                    .roles(Set.of(financeOfficerRole))
                    .build());
        }

        // Advocate User & Advocate Profile
        if (userRepository.findByLogin("advocate1").isEmpty()) {
            User advUser = userRepository.save(User.builder()
                    .name("Advocate Bhupendra Solanki")
                    .login("advocate1")
                    .passwordHash(passwordEncoder.encode("Advocate@123"))
                    .department(legalDept)
                    .active(true)
                    .roles(Set.of(advocateRole))
                    .build());

            advocateRepository.save(Advocate.builder()
                    .user(advUser)
                    .registrationRef("G/1234/2012")
                    .contact("+91-9876543210")
                    .active(true)
                    .build());
        }

        log.info("System seed data initialized successfully.");
    }
}
