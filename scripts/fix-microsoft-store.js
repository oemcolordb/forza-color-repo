import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

class MicrosoftStoreFix {
  static async enableLoopbackExemption() {
    const commands = [
      // Forza Horizon 5 Microsoft Store
      'CheckNetIsolation LoopbackExempt -a -n="Microsoft.SunriseBaseGame_8wekyb3d8bbwe"',
      // Alternative package name
      'CheckNetIsolation LoopbackExempt -a -n="Microsoft.OpusPG_8wekyb3d8bbwe"',
    ]

    console.log('Fixing Microsoft Store sandbox for Forza Horizon 5...')

    for (const cmd of commands) {
      try {
        await execAsync(cmd)
        console.log(`✓ Applied: ${cmd}`)
      } catch (error) {
        console.log(`⚠ Failed: ${cmd}`)
      }
    }
  }

  static async checkFirewall() {
    try {
      const { stdout } = await execAsync(
        'netsh advfirewall firewall show rule name="Forza Telemetry"'
      )
      if (stdout.includes('No rules match')) {
        await this.addFirewallRule()
      } else {
        console.log('✓ Firewall rule exists')
      }
    } catch {
      await this.addFirewallRule()
    }
  }

  static async addFirewallRule() {
    const cmd =
      'netsh advfirewall firewall add rule name="Forza Telemetry" dir=in action=allow protocol=UDP localport=9999'
    try {
      await execAsync(cmd)
      console.log('✓ Firewall rule added for UDP port 9999')
    } catch (error) {
      console.log('⚠ Failed to add firewall rule - run as administrator')
    }
  }

  static async runDiagnostics() {
    console.log('Running Forza telemetry diagnostics...\n')

    await this.enableLoopbackExemption()
    await this.checkFirewall()

    console.log('\nDiagnostics complete. Restart Forza Horizon 5 if needed.')
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  MicrosoftStoreFix.runDiagnostics()
}

export default MicrosoftStoreFix
