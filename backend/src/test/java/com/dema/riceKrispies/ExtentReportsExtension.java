package com.dema.riceKrispies;

import com.aventstack.extentreports.ExtentReports;
import com.aventstack.extentreports.ExtentTest;
import com.aventstack.extentreports.Status;
import com.aventstack.extentreports.markuputils.ExtentColor;
import com.aventstack.extentreports.markuputils.MarkupHelper;
import com.aventstack.extentreports.reporter.ExtentSparkReporter;
import com.aventstack.extentreports.reporter.configuration.Theme;
import org.junit.jupiter.api.extension.*;

import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class ExtentReportsExtension implements BeforeAllCallback, AfterAllCallback, 
        BeforeEachCallback, AfterEachCallback, TestWatcher {

    private static ExtentReports extent;
    private static ExtentTest test;
    private static final String REPORTS_DIR = "backend/test-reports/";
    private static final String REPORT_NAME = "RestAssured-Test-Report.html";

    @Override
    public void beforeAll(ExtensionContext context) throws Exception {
        // Initialize ExtentReports
        String reportPath = REPORTS_DIR + REPORT_NAME;
        ExtentSparkReporter sparkReporter = new ExtentSparkReporter(reportPath);
        
        // Configure the reporter
        sparkReporter.config().setDocumentTitle("RestAssured API Test Report");
        sparkReporter.config().setReportName("Rice Krispies Backend API Tests");
        sparkReporter.config().setTheme(Theme.STANDARD);
        sparkReporter.config().setTimelineEnabled(true);
        
        // Initialize ExtentReports and attach reporter
        extent = new ExtentReports();
        extent.attachReporter(sparkReporter);
        
        // Set system information
        extent.setSystemInfo("Application", "Rice Krispies Backend");
        extent.setSystemInfo("Environment", "Test");
        extent.setSystemInfo("Tester", "Automated Test Suite");
        extent.setSystemInfo("OS", System.getProperty("os.name"));
        extent.setSystemInfo("Java Version", System.getProperty("java.version"));
        extent.setSystemInfo("Test Framework", "JUnit 5 + RestAssured");
        extent.setSystemInfo("Report Generated", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        System.out.println("ExtentReports initialized. Report will be generated at: " + Paths.get(reportPath).toAbsolutePath());
    }

    @Override
    public void beforeEach(ExtensionContext context) throws Exception {
        // Create a test entry for each test method
        String testName = context.getDisplayName();
        String className = context.getTestClass().orElse(Object.class).getSimpleName();
        
        test = extent.createTest(testName);
        test.assignCategory(className);
        test.info("Starting test: " + testName);
    }

    @Override
    public void afterEach(ExtensionContext context) throws Exception {
        // Log test completion
        if (test != null) {
            test.info("Test completed: " + context.getDisplayName());
        }
    }

    @Override
    public void afterAll(ExtensionContext context) throws Exception {
        // Flush the report
        if (extent != null) {
            extent.flush();
            System.out.println("ExtentReports flushed. HTML report generated successfully!");
            System.out.println("Report location: " + Paths.get(REPORTS_DIR + REPORT_NAME).toAbsolutePath());
        }
    }

    @Override
    public void testSuccessful(ExtensionContext context) {
        if (test != null) {
            test.log(Status.PASS, MarkupHelper.createLabel("TEST PASSED", ExtentColor.GREEN));
        }
    }

    @Override
    public void testFailed(ExtensionContext context, Throwable cause) {
        if (test != null) {
            test.log(Status.FAIL, MarkupHelper.createLabel("TEST FAILED", ExtentColor.RED));
            test.fail(cause.getMessage());
            
            // Add stack trace for debugging
            if (cause.getStackTrace() != null && cause.getStackTrace().length > 0) {
                StringBuilder stackTrace = new StringBuilder();
                for (StackTraceElement element : cause.getStackTrace()) {
                    stackTrace.append(element.toString()).append("\n");
                }
                test.fail("<details><summary>Stack Trace</summary><pre>" + stackTrace.toString() + "</pre></details>");
            }
        }
    }

    @Override
    public void testAborted(ExtensionContext context, Throwable cause) {
        if (test != null) {
            test.log(Status.SKIP, MarkupHelper.createLabel("TEST SKIPPED", ExtentColor.ORANGE));
            if (cause != null) {
                test.skip(cause.getMessage());
            }
        }
    }

    // Utility method to log info to current test
    public static void logInfo(String message) {
        if (test != null) {
            test.info(message);
        }
    }

    // Utility method to log pass to current test
    public static void logPass(String message) {
        if (test != null) {
            test.pass(message);
        }
    }

    // Utility method to log fail to current test
    public static void logFail(String message) {
        if (test != null) {
            test.fail(message);
        }
    }

    // Utility method to log warning to current test
    public static void logWarning(String message) {
        if (test != null) {
            test.warning(message);
        }
    }
}

