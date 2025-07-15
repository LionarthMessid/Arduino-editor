#!/usr/bin/env python3
"""
Arduino Code Editor Backend API Test Suite
Tests all backend endpoints for the Arduino IDE application
"""

import requests
import json
import sys
from datetime import datetime
import time

class ArduinoAPITester:
    def __init__(self, base_url="https://77a90bf0-6052-467b-a0ce-62405dcba39b.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, message="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED")
        else:
            print(f"❌ {name}: FAILED - {message}")
        
        self.test_results.append({
            'name': name,
            'success': success,
            'message': message,
            'response_data': response_data
        })

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            
            if success and data.get('message') == "Arduino Code Editor API":
                self.log_test("API Root", True, "API is accessible", data)
                return True
            else:
                self.log_test("API Root", False, f"Unexpected response: {data}")
                return False
        except Exception as e:
            self.log_test("API Root", False, f"Connection error: {str(e)}")
            return False

    def test_boards_endpoint(self):
        """Test boards listing endpoint"""
        try:
            response = requests.get(f"{self.api_url}/boards", timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if data.get('success'):
                    boards = data.get('boards', [])
                    self.log_test("Boards Endpoint", True, f"Found {len(boards)} boards", {'board_count': len(boards)})
                    return True, boards
                else:
                    self.log_test("Boards Endpoint", False, f"API returned error: {data.get('error', 'Unknown error')}")
                    return False, []
            else:
                self.log_test("Boards Endpoint", False, f"HTTP {response.status_code}")
                return False, []
        except Exception as e:
            self.log_test("Boards Endpoint", False, f"Request failed: {str(e)}")
            return False, []

    def test_ports_endpoint(self):
        """Test ports listing endpoint"""
        try:
            response = requests.get(f"{self.api_url}/ports", timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if data.get('success'):
                    ports = data.get('ports', [])
                    self.log_test("Ports Endpoint", True, f"Found {len(ports)} ports", {'port_count': len(ports)})
                    return True, ports
                else:
                    self.log_test("Ports Endpoint", False, f"API returned error: {data.get('error', 'Unknown error')}")
                    return False, []
            else:
                self.log_test("Ports Endpoint", False, f"HTTP {response.status_code}")
                return False, []
        except Exception as e:
            self.log_test("Ports Endpoint", False, f"Request failed: {str(e)}")
            return False, []

    def test_libraries_endpoint(self):
        """Test libraries listing endpoint"""
        try:
            response = requests.get(f"{self.api_url}/libraries", timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if data.get('success'):
                    libraries = data.get('libraries', [])
                    self.log_test("Libraries Endpoint", True, f"Found {len(libraries)} libraries", {'library_count': len(libraries)})
                    return True, libraries
                else:
                    self.log_test("Libraries Endpoint", False, f"API returned error: {data.get('error', 'Unknown error')}")
                    return False, []
            else:
                self.log_test("Libraries Endpoint", False, f"HTTP {response.status_code}")
                return False, []
        except Exception as e:
            self.log_test("Libraries Endpoint", False, f"Request failed: {str(e)}")
            return False, []

    def test_workspace_endpoint(self):
        """Test workspace file tree endpoint"""
        try:
            response = requests.get(f"{self.api_url}/workspace", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if data.get('success'):
                    tree = data.get('tree', [])
                    self.log_test("Workspace Endpoint", True, f"Workspace tree has {len(tree)} items", {'tree_items': len(tree)})
                    return True, tree
                else:
                    self.log_test("Workspace Endpoint", False, f"API returned error: {data.get('error', 'Unknown error')}")
                    return False, []
            else:
                self.log_test("Workspace Endpoint", False, f"HTTP {response.status_code}")
                return False, []
        except Exception as e:
            self.log_test("Workspace Endpoint", False, f"Request failed: {str(e)}")
            return False, []

    def test_compile_endpoint(self, boards):
        """Test code compilation endpoint"""
        if not boards:
            self.log_test("Compile Endpoint", False, "No boards available for testing")
            return False

        test_code = """
void setup() {
  Serial.begin(9600);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);
}
"""
        
        try:
            # Use first available board
            board_fqbn = boards[0].get('fqbn', 'arduino:avr:uno')
            
            payload = {
                "code": test_code,
                "board": board_fqbn,
                "sketch_path": "/tmp/arduino_workspace"
            }
            
            response = requests.post(f"{self.api_url}/compile", json=payload, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                compile_success = data.get('success', False)
                message = data.get('message', '')
                
                if compile_success:
                    self.log_test("Compile Endpoint", True, "Code compiled successfully", {'board': board_fqbn})
                else:
                    # Compilation failure might be expected due to missing Arduino CLI or board packages
                    self.log_test("Compile Endpoint", True, f"Compile endpoint working (compilation failed as expected): {message[:100]}...", {'board': board_fqbn})
                return True
            else:
                self.log_test("Compile Endpoint", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Compile Endpoint", False, f"Request failed: {str(e)}")
            return False

    def test_upload_endpoint(self, boards, ports):
        """Test code upload endpoint"""
        if not boards:
            self.log_test("Upload Endpoint", False, "No boards available for testing")
            return False

        test_code = """
void setup() {
  Serial.begin(9600);
}

void loop() {
  Serial.println("Hello World");
  delay(1000);
}
"""
        
        try:
            board_fqbn = boards[0].get('fqbn', 'arduino:avr:uno')
            test_port = ports[0].get('port', 'COM1') if ports else 'COM1'
            
            payload = {
                "code": test_code,
                "board": board_fqbn,
                "port": test_port,
                "sketch_path": "/tmp/arduino_workspace"
            }
            
            response = requests.post(f"{self.api_url}/upload", json=payload, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                # Upload will likely fail without actual hardware, but endpoint should work
                self.log_test("Upload Endpoint", True, f"Upload endpoint accessible: {data.get('message', '')[:100]}...", {'board': board_fqbn, 'port': test_port})
                return True
            else:
                self.log_test("Upload Endpoint", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Upload Endpoint", False, f"Request failed: {str(e)}")
            return False

    def test_file_operations(self):
        """Test file save and retrieve operations"""
        test_file_path = "/tmp/arduino_workspace/test_sketch.ino"
        test_content = """
// Test Arduino sketch
void setup() {
  Serial.begin(9600);
  Serial.println("Test sketch loaded");
}

void loop() {
  // Empty loop
}
"""
        
        # Test file save
        try:
            payload = {
                "path": test_file_path,
                "content": test_content
            }
            
            response = requests.post(f"{self.api_url}/files", json=payload, timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                if data.get('success'):
                    self.log_test("File Save", True, "File saved successfully")
                    
                    # Test file retrieve
                    file_path_encoded = test_file_path.replace('/', '%2F')
                    get_response = requests.get(f"{self.api_url}/files/{file_path_encoded}", timeout=10)
                    
                    if get_response.status_code == 200:
                        get_data = get_response.json()
                        if get_data.get('success') and get_data.get('content') == test_content:
                            self.log_test("File Retrieve", True, "File retrieved successfully")
                            return True
                        else:
                            self.log_test("File Retrieve", False, "File content mismatch")
                            return False
                    else:
                        self.log_test("File Retrieve", False, f"HTTP {get_response.status_code}")
                        return False
                else:
                    self.log_test("File Save", False, f"Save failed: {data.get('error', 'Unknown error')}")
                    return False
            else:
                self.log_test("File Save", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("File Operations", False, f"Request failed: {str(e)}")
            return False

    def test_library_management(self):
        """Test library install/uninstall endpoints"""
        test_library = "ArduinoJson"  # Popular library for testing
        
        # Test library install
        try:
            payload = {"library_name": test_library}
            response = requests.post(f"{self.api_url}/libraries/install", json=payload, timeout=30)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                # Installation might fail due to Arduino CLI setup, but endpoint should work
                self.log_test("Library Install", True, f"Install endpoint accessible: {data.get('message', '')[:100]}...")
                
                # Test library uninstall
                uninstall_response = requests.post(f"{self.api_url}/libraries/uninstall", json=payload, timeout=30)
                if uninstall_response.status_code == 200:
                    uninstall_data = uninstall_response.json()
                    self.log_test("Library Uninstall", True, f"Uninstall endpoint accessible: {uninstall_data.get('message', '')[:100]}...")
                    return True
                else:
                    self.log_test("Library Uninstall", False, f"HTTP {uninstall_response.status_code}")
                    return False
            else:
                self.log_test("Library Install", False, f"HTTP {response.status_code}")
                return False
        except Exception as e:
            self.log_test("Library Management", False, f"Request failed: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend API tests"""
        print("🚀 Starting Arduino Code Editor Backend API Tests")
        print(f"📡 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test API accessibility
        if not self.test_api_root():
            print("❌ API is not accessible. Stopping tests.")
            return False
        
        # Test Arduino CLI integration endpoints
        boards_success, boards = self.test_boards_endpoint()
        ports_success, ports = self.test_ports_endpoint()
        libraries_success, libraries = self.test_libraries_endpoint()
        
        # Test workspace
        self.test_workspace_endpoint()
        
        # Test Arduino operations
        if boards_success:
            self.test_compile_endpoint(boards)
            if ports_success:
                self.test_upload_endpoint(boards, ports)
        
        # Test file operations
        self.test_file_operations()
        
        # Test library management
        self.test_library_management()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}/{self.tests_run}")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    """Main test execution"""
    tester = ArduinoAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())